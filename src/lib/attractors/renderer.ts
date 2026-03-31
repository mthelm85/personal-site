import { stepDeJong, createDeJongState, type DeJongState } from './deJong';
import { stepClifford, createCliffordState, type CliffordState } from './clifford';
import { stepLorenz, createLorenzState, type LorenzState } from './lorenz';
import { lerp, easeInOut } from '$lib/utils/lerp';
import type { AttractorPreset, AttractorType } from '$lib/data/attractorParams';

type LerpablePreset = {
	type: AttractorType;
	a: number;
	b: number;
	c: number;
	d: number;
	sigma: number;
	rho: number;
	beta: number;
	dt: number;
};

function toFull(p: AttractorPreset): LerpablePreset {
	return {
		type: p.type,
		a: p.a ?? 0,
		b: p.b ?? 0,
		c: p.c ?? 0,
		d: p.d ?? 0,
		sigma: p.sigma ?? 10,
		rho: p.rho ?? 28,
		beta: p.beta ?? 2.667,
		dt: p.dt ?? 0.005
	};
}

export class AttractorRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private rafId = 0;
	running = false; // public so AttractorCanvas can check it
	private reducedMotion: boolean;

	private cur: LerpablePreset;
	private startP: LerpablePreset; // renamed to avoid conflict with start()
	private target: LerpablePreset;
	private morphT = 1;

	private dj: DeJongState = createDeJongState();
	private cl: CliffordState = createCliffordState();
	private lz: LorenzState = createLorenzState();

	private itersPerFrame: number;
	private fadeAlpha = 0;
	private fadingOut = false;
	private fadingIn = false;

	private flowFieldFn: ((x: number, y: number) => number) | null = null;
	private flowPoints: Array<{ x: number; y: number; age: number }> = [];

	private frameCount = 0;
	private static readonly ATTRACTOR_FRAME_LIMIT = 2000;
	private static readonly FLOW_FIELD_FRAME_LIMIT = 3000;

	constructor(canvas: HTMLCanvasElement, initial: AttractorPreset, itersPerFrame = 1200) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.itersPerFrame = itersPerFrame;
		this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const full = toFull(initial);
		this.cur = { ...full };
		this.startP = { ...full };
		this.target = { ...full };
	}

	setPreset(preset: AttractorPreset) {
		this.frameCount = 0;
		const full = toFull(preset);
		if (full.type !== this.cur.type) {
			this.target = { ...full };
			this.fadingOut = true;
		} else {
			this.startP = { ...this.cur };
			this.target = { ...full };
			this.morphT = 0;
		}
	}

	setFlowField(fn: ((x: number, y: number) => number) | null) {
		this.frameCount = 0;
		this.flowFieldFn = fn;
		if (fn) {
			const w = this.canvas.width;
			const h = this.canvas.height;
			this.flowPoints = Array.from({ length: 300 }, () => ({
				x: Math.random() * w,
				y: Math.random() * h,
				age: Math.floor(Math.random() * 80)
			}));
			this.ctx.clearRect(0, 0, w, h);
		} else {
			this.flowPoints = [];
		}
	}

	private lerpParams() {
		if (this.morphT >= 1) return;
		this.morphT = Math.min(this.morphT + 0.012, 1);
		const t = easeInOut(this.morphT);
		const keys: (keyof Omit<LerpablePreset, 'type'>)[] = [
			'a',
			'b',
			'c',
			'd',
			'sigma',
			'rho',
			'beta',
			'dt'
		];
		for (const k of keys) {
			(this.cur as Record<string, unknown>)[k] = lerp(
				this.startP[k] as number,
				this.target[k] as number,
				t
			);
		}
	}

	private plotPoint(nx: number, ny: number, warm: boolean) {
		const w = this.canvas.width;
		const h = this.canvas.height;

		let cx: number, cy: number;
		if (this.cur.type === 'lorenz') {
			cx = ((nx + 25) / 50) * w;
			cy = h - (ny / 52) * h;
		} else {
			cx = ((nx + 2.5) / 5) * w;
			cy = ((ny + 2.5) / 5) * h;
		}

		if (cx < 0 || cx > w || cy < 0 || cy > h) return;
		this.ctx.fillStyle = warm ? 'rgba(176,136,96,0.010)' : 'rgba(106,104,160,0.015)';
		this.ctx.fillRect(Math.round(cx), Math.round(cy), 1, 1);
	}

	private renderAttractor() {
		const p = this.cur;
		for (let i = 0; i < this.itersPerFrame; i++) {
			const warm = Math.random() > 0.75;
			if (p.type === 'dejong') {
				this.dj = stepDeJong(this.dj, { a: p.a, b: p.b, c: p.c, d: p.d });
				this.plotPoint(this.dj.x, this.dj.y, warm);
			} else if (p.type === 'clifford') {
				this.cl = stepClifford(this.cl, { a: p.a, b: p.b, c: p.c, d: p.d });
				this.plotPoint(this.cl.x, this.cl.y, warm);
			} else {
				for (let j = 0; j < 4; j++) {
					this.lz = stepLorenz(this.lz, {
						sigma: p.sigma,
						rho: p.rho,
						beta: p.beta,
						dt: p.dt
					});
				}
				this.plotPoint(this.lz.x, this.lz.z, warm);
			}
		}
	}

	private renderFlowField() {
		if (!this.flowFieldFn) return;
		const fn = this.flowFieldFn;
		const w = this.canvas.width;
		const h = this.canvas.height;

		this.ctx.fillStyle = 'rgba(8,8,15,0.02)';
		this.ctx.fillRect(0, 0, w, h);

		for (const pt of this.flowPoints) {
			const fx = (pt.x / w) * 4 - 2;
			const fy = (pt.y / h) * 4 - 2;
			let angle = 0;
			try {
				angle = fn(fx, fy);
			} catch {
				angle = 0;
			}
			const speed = 1.5;
			const nx = pt.x + Math.cos(angle) * speed;
			const ny = pt.y + Math.sin(angle) * speed;

			this.ctx.beginPath();
			this.ctx.moveTo(pt.x, pt.y);
			this.ctx.lineTo(nx, ny);
			this.ctx.strokeStyle = `rgba(106,104,160,${0.3 * (1 - pt.age / 100)})`;
			this.ctx.lineWidth = 0.5;
			this.ctx.stroke();

			pt.x = nx;
			pt.y = ny;
			pt.age++;

			if (pt.x < 0 || pt.x > w || pt.y < 0 || pt.y > h || pt.age > 100) {
				pt.x = Math.random() * w;
				pt.y = Math.random() * h;
				pt.age = 0;
			}
		}
	}

	private frame() {
		if (!this.running) return;

		this.frameCount++;

		if (this.flowFieldFn) {
			this.renderFlowField();
			if (this.frameCount < AttractorRenderer.FLOW_FIELD_FRAME_LIMIT) {
				this.rafId = requestAnimationFrame(() => this.frame());
			} else {
				this.running = false;
			}
			return;
		}

		this.lerpParams();
		this.renderAttractor();

		const w = this.canvas.width;
		const h = this.canvas.height;

		this.ctx.fillStyle = 'rgba(8,8,15,0.004)';
		this.ctx.fillRect(0, 0, w, h);

		if (this.fadingOut) {
			this.fadeAlpha = Math.min(this.fadeAlpha + 0.06, 1);
			this.ctx.fillStyle = `rgba(8,8,15,${this.fadeAlpha})`;
			this.ctx.fillRect(0, 0, w, h);
			if (this.fadeAlpha >= 1) {
				this.fadingOut = false;
				this.fadingIn = true;
				this.cur.type = this.target.type;
				this.startP = { ...this.cur };
				this.morphT = 0;
				this.dj = createDeJongState();
				this.cl = createCliffordState();
				this.lz = createLorenzState();
				this.frameCount = 0; // reset after transition
			}
		}

		if (this.fadingIn) {
			this.fadeAlpha = Math.max(this.fadeAlpha - 0.12, 0);
			this.ctx.fillStyle = `rgba(8,8,15,${this.fadeAlpha})`;
			this.ctx.fillRect(0, 0, w, h);
			if (this.fadeAlpha <= 0) this.fadingIn = false;
		}

		// Stop after density is built; transitions always run to completion
		const settled = this.frameCount >= AttractorRenderer.ATTRACTOR_FRAME_LIMIT
			&& !this.fadingOut && !this.fadingIn && this.morphT >= 1;

		if (settled) {
			this.running = false;
		} else {
			this.rafId = requestAnimationFrame(() => this.frame());
		}
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.frameCount = 0;
		if (this.reducedMotion) {
			this.renderAttractor();
			return;
		}
		this.frame();
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.rafId);
	}

	resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		this.canvas.width = Math.round(this.canvas.clientWidth * dpr);
		this.canvas.height = Math.round(this.canvas.clientHeight * dpr);
		this.dj = createDeJongState();
		this.cl = createCliffordState();
		this.lz = createLorenzState();
	}
}
