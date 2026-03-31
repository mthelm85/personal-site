export interface DeJongState {
	x: number;
	y: number;
}

export interface DeJongParams {
	a: number;
	b: number;
	c: number;
	d: number;
}

export function stepDeJong(s: DeJongState, p: DeJongParams): DeJongState {
	return {
		x: Math.sin(p.a * s.y) - Math.cos(p.b * s.x),
		y: Math.sin(p.c * s.x) - Math.cos(p.d * s.y)
	};
}

export function createDeJongState(): DeJongState {
	return { x: 0.1, y: 0.1 };
}
