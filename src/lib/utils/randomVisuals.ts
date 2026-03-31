import type { AttractorPreset, AttractorType } from '$lib/data/attractorParams';

// ─── Helpers ────────────────────────────────────────────

function rand(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function randChoice<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/** Random value in [min, max] that avoids the dead zone (-deadzone, +deadzone) */
function avoidZero(min: number, max: number, deadzone = 0.3): number {
	let v: number;
	do {
		v = rand(min, max);
	} while (Math.abs(v) < deadzone);
	return v;
}

function coeff(): number {
	return +(rand(0.5, 3.5) * randChoice([1, -1])).toFixed(2);
}

// ─── Attractor Presets ──────────────────────────────────

export function randomAttractorPreset(): AttractorPreset {
	const type: AttractorType = randChoice(['dejong', 'clifford']);
	return {
		type,
		a: avoidZero(-3, 3),
		b: avoidZero(-3, 3),
		c: avoidZero(-3, 3),
		d: avoidZero(-3, 3),
		label: type === 'dejong'
			? 'x_{n+1} = \\sin(ay) - \\cos(bx)'
			: 'x_{n+1} = \\sin(ay) + c\\cos(ax)'
	};
}

// ─── Flow Field Building Blocks ─────────────────────────

type FlowFn = (x: number, y: number) => number;

interface Ingredient {
	fn: (k: number) => FlowFn;
	label: (k: string) => string;
}

const INGREDIENTS: Ingredient[] = [
	// Trig products
	{
		fn: (k) => (x, y) => Math.sin(k * x * y),
		label: (k) => `\\sin(${k}xy)`
	},
	{
		fn: (k) => (x, y) => Math.cos(k * x * y),
		label: (k) => `\\cos(${k}xy)`
	},
	{
		fn: (k) => (x, y) => Math.sin(k * x) * Math.cos(y),
		label: (k) => `\\sin(${k}x)\\cos(y)`
	},
	{
		fn: (k) => (x, y) => Math.cos(x * x - k * y * y),
		label: (k) => `\\cos(x^2 - ${k}y^2)`
	},
	{
		fn: (k) => (x, y) => Math.sin(k * x) + Math.cos(k * y),
		label: (k) => `\\sin(${k}x) + \\cos(${k}y)`
	},
	// Inverse trig
	{
		fn: () => (x, y) => Math.atan2(y, x),
		label: () => `\\arctan\\frac{y}{x}`
	},
	{
		fn: (k) => (x, y) => Math.atan(k * x * y),
		label: (k) => `\\arctan(${k}xy)`
	},
	// Hyperbolic
	{
		fn: (k) => (x, y) => Math.tanh(k * x * y),
		label: (k) => `\\tanh(${k}xy)`
	},
	{
		fn: (k) => (x, y) => Math.sinh(x) * Math.cos(k * y),
		label: (k) => `\\sinh(x)\\cos(${k}y)`
	},
	// Log (with epsilon guards)
	{
		fn: () => (x, y) => Math.log(x * x + y * y + 0.1),
		label: () => `\\ln(x^2+y^2)`
	},
	{
		fn: (k) => (x, y) => Math.log(Math.abs(Math.sin(k * x)) + 0.01),
		label: (k) => `\\ln|\\sin(${k}x)|`
	},
	{
		fn: (k) => (x, y) => Math.log(Math.abs(Math.cos(k * y)) + 0.01),
		label: (k) => `\\ln|\\cos(${k}y)|`
	},
	// Polynomial-ish
	{
		fn: (k) => (x, y) => k * x * y,
		label: (k) => `${k}xy`
	},
	{
		fn: (k) => (x, y) => k * (x * x - y * y),
		label: (k) => `${k}(x^2-y^2)`
	},
	// Radial
	{
		fn: (k) => (x, y) => Math.sin(k * Math.sqrt(x * x + y * y + 0.01)),
		label: (k) => `\\sin(${k}r)`
	}
];

/** Combine operators */
const COMBINATORS: Array<{
	combine: (a: FlowFn, b: FlowFn) => FlowFn;
	label: (a: string, b: string) => string;
}> = [
	{
		combine: (a, b) => (x, y) => a(x, y) + b(x, y),
		label: (a, b) => `${a} + ${b}`
	},
	{
		combine: (a, b) => (x, y) => a(x, y) * b(x, y),
		label: (a, b) => `(${a})(${b})`
	},
	{
		combine: (a, b) => (x, y) => a(x, y) + b(x, y) * 0.5,
		label: (a, b) => `${a} + \\tfrac{1}{2}${b}`
	}
];

export function randomFlowField(): { fn: FlowFn; label: string } {
	// Pick 2 distinct ingredients
	const shuffled = [...INGREDIENTS].sort(() => Math.random() - 0.5);
	const ing1 = shuffled[0];
	const ing2 = shuffled[1];

	const k1 = coeff();
	const k2 = coeff();

	const fn1 = ing1.fn(k1);
	const fn2 = ing2.fn(k2);
	const lbl1 = ing1.label(String(k1));
	const lbl2 = ing2.label(String(k2));

	const combinator = randChoice(COMBINATORS);

	const combinedFn = combinator.combine(fn1, fn2);
	const combinedLabel = combinator.label(lbl1, lbl2);

	// Wrap in try/catch for safety — any NaN/Infinity → 0
	const safeFn: FlowFn = (x, y) => {
		try {
			const v = combinedFn(x, y);
			if (!Number.isFinite(v)) return 0;
			return v;
		} catch {
			return 0;
		}
	};

	return { fn: safeFn, label: combinedLabel };
}

// ─── Generate All Section Visuals ───────────────────────

export interface SectionVisuals {
	attractors: Record<string, AttractorPreset>;
	flowFields: Record<string, { fn: FlowFn; label: string }>;
}

export function generateSectionVisuals(): SectionVisuals {
	return {
		attractors: {
			hero: {
				type: 'dejong',
				a: 1.4,
				b: -2.3,
				c: 2.4,
				d: -2.1,
				label: 'x_{n+1} = \\sin(ay) - \\cos(bx)'
			},
			projects: randomAttractorPreset()
		},
		flowFields: {
			about: randomFlowField(),
			experience: randomFlowField(),
			contact: randomFlowField()
		}
	};
}
