export interface LorenzState {
	x: number;
	y: number;
	z: number;
}

export interface LorenzParams {
	sigma: number;
	rho: number;
	beta: number;
	dt: number;
}

export function stepLorenz(s: LorenzState, p: LorenzParams): LorenzState {
	const dx = p.sigma * (s.y - s.x);
	const dy = s.x * (p.rho - s.z) - s.y;
	const dz = s.x * s.y - p.beta * s.z;
	return {
		x: s.x + dx * p.dt,
		y: s.y + dy * p.dt,
		z: s.z + dz * p.dt
	};
}

export function createLorenzState(): LorenzState {
	// Start slightly off the unstable equilibrium
	return { x: 0.1, y: 0, z: 0 };
}
