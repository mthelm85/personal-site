export type AttractorType = 'dejong' | 'clifford' | 'lorenz';

export interface AttractorPreset {
	type: AttractorType;
	// De Jong / Clifford parameters
	a?: number;
	b?: number;
	c?: number;
	d?: number;
	// Lorenz parameters
	sigma?: number;
	rho?: number;
	beta?: number;
	dt?: number;
	label?: string; // LaTeX string
}

export interface FlowFieldDef {
	fn: (x: number, y: number) => number;
	label: string;
}
