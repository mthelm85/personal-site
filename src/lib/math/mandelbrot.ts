/**
 * Mandelbrot set renderer.
 * Draws directly into a provided canvas context.
 * Renders progressively (coarse → fine) for responsiveness.
 */
export class MandelbrotRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private rafId = 0;
	private running = false;

	// View state
	private centerX = -0.5;
	private centerY = 0;
	private zoom = 1;
	private maxIter = 80;

	// Progressive render pass
	private pass = 0;
	private passes = [16, 8, 4, 2, 1];

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
	}

	private iterMandelbrot(cx: number, cy: number): number {
		let x = 0,
			y = 0,
			i = 0;
		while (x * x + y * y <= 4 && i < this.maxIter) {
			const xt = x * x - y * y + cx;
			y = 2 * x * y + cy;
			x = xt;
			i++;
		}
		return i;
	}

	private renderPass(blockSize: number) {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = this.canvas.width / dpr;
		const h = this.canvas.height / dpr;
		const scale = 3 / (this.zoom * Math.min(w, h));

		for (let py = 0; py < h; py += blockSize) {
			for (let px = 0; px < w; px += blockSize) {
				const re = (px - w / 2) * scale + this.centerX;
				const im = (py - h / 2) * scale + this.centerY;
				const iter = this.iterMandelbrot(re, im);
				if (iter === this.maxIter) {
					this.ctx.fillStyle = '#08080f';
				} else {
					const t = iter / this.maxIter;
					const r = Math.round(106 * t);
					const g = Math.round(104 * t * 0.5);
					const b = Math.round(160 + 96 * t);
					this.ctx.fillStyle = `rgb(${r},${g},${b})`;
				}
				this.ctx.fillRect(px, py, blockSize, blockSize);
			}
		}
	}

	private loop() {
		if (!this.running) return;
		if (this.pass < this.passes.length) {
			this.renderPass(this.passes[this.pass]);
			this.pass++;
		}
		this.rafId = requestAnimationFrame(() => this.loop());
	}

	redraw() {
		this.pass = 0;
	}

	start() {
		this.running = true;
		this.loop();
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.rafId);
	}
}
