import type { ReplMode } from '$lib/stores/repl';

export interface ParseResult {
	ok: boolean;
	fn?: (x: number, y: number) => number;
	mode?: ReplMode;
	errorAt?: number;
}

/** Named equation triggers → special modes */
const NAMED_TRIGGERS: Record<string, ReplMode> = {
	euler: 'euler',
	'e^(i*pi)+1=0': 'euler',
	'e^(i*pi) + 1 = 0': 'euler',
	mandelbrot: 'mandelbrot',
	lorenz: 'lorenz',
	fibonacci: 'flowfield',
	golden: 'flowfield',
	conway: 'conway',
	'game-of-life': 'conway',
	'game of life': 'conway'
};

export async function parseEquation(input: string): Promise<ParseResult> {
	const trimmed = input.trim().toLowerCase();

	// Check named triggers first
	const mode = NAMED_TRIGGERS[trimmed];
	if (mode) return { ok: true, mode };

	try {
		const math = await import('mathjs');
		const compiled = math.compile(input);
		const fn = (x: number, y: number) => {
			const scope: Record<string, number> = { x, y };
			const result = compiled.evaluate(scope);
			return typeof result === 'number' ? result : 0;
		};
		fn(0.5, 0.5); // test call
		return { ok: true, fn, mode: 'flowfield' };
	} catch {
		return { ok: false, errorAt: 0 };
	}
}
