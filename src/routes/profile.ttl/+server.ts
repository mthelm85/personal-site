import { buildGraph } from '$lib/data/graph';
import { toTurtle } from '$lib/data/turtle';
import { IDENTITY, SITE_URL } from '$lib/data/identity';

export const prerender = true;

const FOAF = 'http://xmlns.com/foaf/0.1/';

/** The same graph as the page's JSON-LD, plus FOAF terms on the person for
 *  consumers that speak FOAF rather than schema.org. */
export function GET() {
	const graph = buildGraph();
	const person = graph['@graph'][0];
	Object.assign(person, {
		'@type': [person['@type'], `${FOAF}Person`],
		[`${FOAF}name`]: IDENTITY.name,
		[`${FOAF}homepage`]: { '@id': SITE_URL },
		[`${FOAF}account`]: IDENTITY.sameAs.map((url) => ({ '@id': url }))
	});

	return new Response(toTurtle(graph), {
		headers: { 'Content-Type': 'text/turtle; charset=utf-8' }
	});
}
