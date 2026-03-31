export interface CliffordState {
	x: number;
	y: number;
}

export interface CliffordParams {
	a: number;
	b: number;
	c: number;
	d: number;
}

export function stepClifford(s: CliffordState, p: CliffordParams): CliffordState {
	return {
		x: Math.sin(p.a * s.y) + p.c * Math.cos(p.a * s.x),
		y: Math.sin(p.b * s.x) + p.d * Math.cos(p.b * s.y)
	};
}

export function createCliffordState(): CliffordState {
	return { x: 0.1, y: 0.1 };
}
