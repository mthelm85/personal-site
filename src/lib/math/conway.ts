/**
 * Conway's Game of Life renderer.
 */
export class ConwayRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private rafId = 0;
	private running = false;
	private cellSize = 6;
	private cols = 0;
	private rows = 0;
	private grid: Uint8Array = new Uint8Array(0);
	private nextGrid: Uint8Array = new Uint8Array(0);
	private frameInterval = 80; // ms per generation
	private lastFrame = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.init();
	}

	private init() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = this.canvas.width / dpr;
		const h = this.canvas.height / dpr;
		this.cols = Math.floor(w / this.cellSize);
		this.rows = Math.floor(h / this.cellSize);
		const size = this.cols * this.rows;
		this.grid = new Uint8Array(size);
		this.nextGrid = new Uint8Array(size);
		// Random seed at ~30% density
		for (let i = 0; i < size; i++) {
			this.grid[i] = Math.random() < 0.3 ? 1 : 0;
		}
	}

	private step() {
		const { cols, rows, grid, nextGrid } = this;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				let neighbors = 0;
				for (let dr = -1; dr <= 1; dr++) {
					for (let dc = -1; dc <= 1; dc++) {
						if (dr === 0 && dc === 0) continue;
						const nr = (r + dr + rows) % rows;
						const nc = (c + dc + cols) % cols;
						neighbors += grid[nr * cols + nc];
					}
				}
				const alive = grid[r * cols + c];
				nextGrid[r * cols + c] =
					alive ? (neighbors === 2 || neighbors === 3 ? 1 : 0) : neighbors === 3 ? 1 : 0;
			}
		}
		this.grid.set(nextGrid);
	}

	private draw() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = this.canvas.width / dpr;
		const h = this.canvas.height / dpr;
		this.ctx.clearRect(0, 0, w, h);
		this.ctx.fillStyle = '#08080f';
		this.ctx.fillRect(0, 0, w, h);

		const { cols, rows, grid, cellSize } = this;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (grid[r * cols + c]) {
					this.ctx.fillStyle = 'rgba(106,104,160,0.6)';
					this.ctx.fillRect(c * cellSize, r * cellSize, cellSize - 1, cellSize - 1);
				}
			}
		}
	}

	private loop = (ts: number) => {
		if (!this.running) return;
		if (ts - this.lastFrame > this.frameInterval) {
			this.step();
			this.draw();
			this.lastFrame = ts;
		}
		this.rafId = requestAnimationFrame(this.loop);
	};

	start() {
		this.running = true;
		this.rafId = requestAnimationFrame(this.loop);
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.rafId);
	}
}
