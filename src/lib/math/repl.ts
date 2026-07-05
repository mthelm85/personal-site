export interface ParseResult {
	ok: boolean;
	fn?: (x: number, y: number) => number;
	errorAt?: number;
}

export async function parseEquation(input: string): Promise<ParseResult> {
	try {
		const math = await import('mathjs');
		const compiled = math.compile(input);
		const fn = (x: number, y: number) => {
			const scope: Record<string, number> = { x, y };
			const result = compiled.evaluate(scope);
			return typeof result === 'number' ? result : 0;
		};
		fn(0.5, 0.5); // test call
		return { ok: true, fn };
	} catch {
		return { ok: false, errorAt: 0 };
	}
}
