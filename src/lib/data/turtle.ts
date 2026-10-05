/**
 * Minimal Turtle serializer for the site's JSON-LD graph (see graph.ts).
 *
 * It handles exactly the shapes buildGraph() produces under a schema.org
 * @context: plain keys are schema.org terms, keys/types written as full IRIs
 * are used verbatim, `{ '@id' }`-only objects are references, other objects
 * without an @id become nested blank nodes, and nested objects that carry an
 * @id plus data are hoisted to top-level subjects. Anything it can't express
 * faithfully throws, so a bad value fails the build instead of shipping.
 */

type Node = Record<string, unknown>;

const SCHEMA = 'https://schema.org/';

/** schema.org properties whose values are IRIs (`"@type": "@id"` in the
 *  schema.org context), not string literals. */
const IRI_PROPS = new Set(['url', 'sameAs', 'codeRepository']);

const PREFIXES: Record<string, string> = {
	schema: SCHEMA,
	foaf: 'http://xmlns.com/foaf/0.1/'
};

const INDENT = '    ';

function iri(value: string): string {
	if (!/^[a-z][a-z0-9+.-]*:[^\s<>"{}|^`\\]*$/i.test(value)) {
		throw new Error(`Not an absolute IRI: ${value}`);
	}
	for (const [prefix, ns] of Object.entries(PREFIXES)) {
		if (value.startsWith(ns)) {
			const local = value.slice(ns.length);
			if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(local)) return `${prefix}:${local}`;
		}
	}
	return `<${value}>`;
}

/** Expand a JSON-LD key or @type value against the schema.org vocab. */
function term(key: string): string {
	return key.includes(':') ? key : SCHEMA + key;
}

function literal(value: string | number | boolean): string {
	if (typeof value === 'boolean') return String(value);
	if (typeof value === 'number') {
		if (!Number.isInteger(value)) throw new Error(`Non-integer number: ${value}`);
		return String(value);
	}
	const escaped = value
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r');
	return `"${escaped}"`;
}

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [value];
}

export function toTurtle(graph: { '@graph': Node[] }): string {
	const queue = [...graph['@graph']];
	const blocks: string[] = [];

	function object(key: string, value: unknown, depth: number): string {
		if (value !== null && typeof value === 'object') {
			const node = value as Node;
			if (typeof node['@id'] === 'string') {
				if (Object.keys(node).length > 1) queue.push(node);
				return iri(node['@id']);
			}
			return `[\n${body(node, depth + 1)}\n${INDENT.repeat(depth)}]`;
		}
		if (IRI_PROPS.has(key)) return iri(String(value));
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			return literal(value);
		}
		throw new Error(`Unsupported value for ${key}: ${String(value)}`);
	}

	function body(node: Node, depth: number): string {
		const pad = INDENT.repeat(depth);
		const lines: string[] = [];
		if (node['@type'] !== undefined) {
			lines.push(`${pad}a ${asArray(node['@type']).map((t) => iri(term(String(t)))).join(', ')}`);
		}
		for (const [key, value] of Object.entries(node)) {
			if (key.startsWith('@')) continue;
			const objects = asArray(value).map((v) => object(key, v, depth));
			lines.push(`${pad}${iri(term(key))} ${objects.join(', ')}`);
		}
		return lines.join(' ;\n');
	}

	while (queue.length) {
		const node = queue.shift()!;
		blocks.push(`${iri(String(node['@id']))}\n${body(node, 1)} .`);
	}

	const header = Object.entries(PREFIXES)
		.map(([prefix, ns]) => `@prefix ${prefix}: <${ns}> .`)
		.join('\n');
	return `${header}\n\n${blocks.join('\n\n')}\n`;
}
