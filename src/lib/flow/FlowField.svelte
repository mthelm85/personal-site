<script lang="ts">
	import { onMount } from 'svelte';
	import { currentEquation, replMode } from '$lib/stores/repl';

	type FieldFn = (x: number, y: number) => number;

	interface Props {
		text?: string;
		/** scroll distance (in viewport heights) over which the field verticalizes and fades */
		scrollRange?: number;
		/** progress (0-1) at which the fade-out begins */
		fadeStart?: number;
		/** opacity floor the field settles at behind the content sections */
		ambient?: number;
	}

	let { text = 'Matt Helm', scrollRange = 1.3, fadeStart = 0.55, ambient = 0.3 }: Props = $props();

	let canvas: HTMLCanvasElement;

	const SIZES = [6, 8, 10];
	const GLOWS = 6;

	// Quality tiers, best → worst. Tier 0 reproduces the original full-quality
	// settings exactly, so capable machines are untouched. A runtime monitor
	// (in frame()) steps between tiers based on measured render-work time, so a
	// weak GPU — integrated laptop graphics, thermal throttling — settles at a
	// sustainable tier instead of stuttering at tier 0 forever.
	//   ppp         pixels-per-particle (lower = denser)
	//   cap         hard particle ceiling
	//   dprCap      device-pixel-ratio cap (the trail fill scales with this)
	//   renderEvery render 1-in-N frames (2 ≈ 30fps) — last-resort lever
	const TIERS = [
		{ ppp: 200, cap: 8000, dprCap: 2, renderEvery: 1 },
		{ ppp: 300, cap: 5000, dprCap: 2, renderEvery: 1 },
		{ ppp: 460, cap: 3000, dprCap: 1.5, renderEvery: 1 },
		{ ppp: 650, cap: 1800, dprCap: 1, renderEvery: 2 }
	];

	// Bridge from the REPL stores into the simulation closure (assigned in onMount)
	let applyUserFn: (fn: FieldFn | null) => void = () => {};

	$effect(() => {
		const eq = $currentEquation;
		const mode = $replMode;
		if (mode === 'flowfield' && eq) {
			let cancelled = false;
			import('$lib/math/repl').then(({ parseEquation }) =>
				parseEquation(eq).then((r) => {
					if (!cancelled) applyUserFn(r.ok && r.fn ? r.fn : null);
				})
			);
			return () => {
				cancelled = true;
			};
		}
		applyUserFn(null);
	});

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Seed a starting tier from cheap hardware hints, then let the runtime
		// monitor make the real call. These signals are coarse and can't see GPU
		// fill-rate or throttling, so they only nudge the starting point — the
		// monitor promotes a wrongly-demoted machine back up within seconds.
		function seedTier(): number {
			const nav = navigator as any;
			const cores = nav.hardwareConcurrency || 4;
			const mem = nav.deviceMemory || 4;
			let s = 0;
			if (cores <= 4 || mem <= 4) s = 1;
			if (cores <= 2 || mem <= 2 || nav.connection?.saveData) s = 2;
			return s;
		}
		let tier = seedTier();
		let dpr = Math.min(window.devicePixelRatio || 1, TIERS[tier].dprCap);

		// Theme: canvas background tracks the site's --color-bg token; digit
		// ramps are pale-on-dark or ink-on-light depending on the color scheme.
		const lightMq = window.matchMedia('(prefers-color-scheme: light)');

		function themeColors() {
			const light = lightMq.matches;
			let bg = getComputedStyle(document.documentElement)
				.getPropertyValue('--color-bg')
				.trim();
			if (!/^#[0-9a-fA-F]{6}$/.test(bg)) bg = light ? '#fafaf8' : '#08080f';
			const br = parseInt(bg.slice(1, 3), 16);
			const bgn = parseInt(bg.slice(3, 5), 16);
			const bb = parseInt(bg.slice(5, 7), 16);
			return {
				bg,
				trail: `rgba(${br},${bgn},${bb},0.32)`,
				ramp: (k: number) =>
					light
						? `rgba(${(140 - k * 105) | 0},${(148 - k * 78) | 0},${(168 - k * 43) | 0},${(0.3 + k * 0.45).toFixed(2)})`
						: `rgba(${(100 + k * 60) | 0},${(122 + k * 70) | 0},${(150 + k * 65) | 0},${(0.28 + k * 0.38).toFixed(2)})`
			};
		}

		let COLORS = themeColors();

		type Sprite = { c: HTMLCanvasElement; w: number };
		const sprites: Sprite[][][] = [];

		function bakeSprites() {
			for (let d = 0; d < 10; d++) {
				sprites[d] = [];
				for (let si = 0; si < SIZES.length; si++) {
					sprites[d][si] = [];
					for (let g = 0; g < GLOWS; g++) {
						const fs = SIZES[si];
						const pad = 2;
						const c = document.createElement('canvas');
						c.width = (fs + pad * 2) * dpr;
						c.height = (fs + pad * 2) * dpr;
						const cc = c.getContext('2d')!;
						cc.scale(dpr, dpr);
						cc.fillStyle = COLORS.ramp(g / (GLOWS - 1));
						cc.font = `400 ${fs}px 'JetBrains Mono', Consolas, monospace`;
						cc.textAlign = 'center';
						cc.textBaseline = 'middle';
						cc.fillText(String(d), fs / 2 + pad, fs / 2 + pad);
						sprites[d][si][g] = { c, w: fs + pad * 2 };
					}
				}
			}
		}

		bakeSprites();

		interface Particle {
			x: number;
			y: number;
			s: number;
			d: number;
			si: number;
			ph: number;
			glow: number;
			dwell: number;
			wasInside: boolean;
			nextFlip: number;
		}

		let W = 0;
		let H = 0;
		let mask = new Uint8Array(0);
		let particles: Particle[] = [];
		let progress = 0;
		let depth = 0;
		let t = 0;

		// User function field (from the REPL): f(x,y) → angle, sampled to a
		// coarse cos/sin grid because mathjs is too slow to call per particle.
		const CELL = 14;
		let userFn: FieldFn | null = null;
		let userW = 0;
		let gw = 0;
		let gh = 0;
		let gCos = new Float32Array(0);
		let gSin = new Float32Array(0);

		function rebuildUserGrid() {
			if (!userFn) return;
			gw = Math.ceil(W / CELL) + 1;
			gh = Math.ceil(H / CELL) + 1;
			gCos = new Float32Array(gw * gh);
			gSin = new Float32Array(gw * gh);
			for (let j = 0; j < gh; j++) {
				for (let i = 0; i < gw; i++) {
					// same domain as the old site's flow field: x, y ∈ [-2, 2]
					const fx = ((i * CELL) / W) * 4 - 2;
					const fy = ((j * CELL) / H) * 4 - 2;
					let a = 0;
					try {
						a = userFn(fx, fy);
					} catch {
						a = 0;
					}
					if (!Number.isFinite(a)) a = 0;
					gCos[j * gw + i] = Math.cos(a);
					gSin[j * gw + i] = Math.sin(a);
				}
			}
		}

		function buildMask() {
			const off = document.createElement('canvas');
			off.width = W;
			off.height = H;
			const octx = off.getContext('2d')!;
			let fs = 120;
			octx.font = `800 ${fs}px 'Segoe UI', system-ui, sans-serif`;
			const tw = octx.measureText(text).width;
			fs = Math.min(H * 0.3, (fs * (W * 0.88)) / tw);
			octx.font = `800 ${fs}px 'Segoe UI', system-ui, sans-serif`;
			octx.textAlign = 'center';
			octx.textBaseline = 'middle';
			octx.fillStyle = '#fff';
			octx.fillText(text, W / 2, H * 0.46);
			const data = octx.getImageData(0, 0, W, H).data;
			mask = new Uint8Array(W * H);
			for (let i = 0; i < W * H; i++) mask[i] = data[i * 4 + 3] > 100 ? 1 : 0;
		}

		function makeParticle(): Particle {
			return {
				x: Math.random() * W,
				y: Math.random() * H,
				s: 0.6 + Math.random() * 1.3,
				d: (Math.random() * 10) | 0,
				si: (Math.random() * SIZES.length) | 0,
				ph: Math.random() * Math.PI * 2,
				glow: 0,
				dwell: 0,
				wasInside: false,
				nextFlip: Math.random() * 200
			};
		}

		function update(p: Particle, dt: number) {
			const swirlF = Math.max(0, 1 - progress * 1.35);
			const biasV = 1.35 + 2.6 * progress;
			const dwellOn = progress < 0.12;

			const xi = p.x | 0;
			const yi = p.y | 0;
			const inside =
				dwellOn && xi >= 0 && xi < W && yi >= 0 && yi < H ? mask[yi * W + xi] : 0;

			if (inside && !p.wasInside) p.dwell = 360 + Math.random() * 480;
			if (!inside) p.dwell = 0;
			p.wasInside = !!inside;
			const stuck = inside && p.dwell > 0;
			if (stuck) p.dwell -= dt;

			p.glow += ((stuck ? 1 : 0) - p.glow) * 0.08 * dt;

			const ang =
				Math.sin(p.x * 0.0057 + t * 0.55 + p.ph * 0.3) * 1.35 +
				Math.cos(p.y * 0.0071 - t * 0.35 - p.ph * 0.2) * 1.35 +
				Math.sin((p.x * 0.71 + p.y) * 0.0033 + t * 0.22 + p.ph) * 0.9 +
				Math.cos((p.x - p.y * 0.618) * 0.0089 + t * 0.31 + p.ph * 0.5) * 0.5;
			const speedF = stuck ? 0.04 : 1.0;
			let vx = Math.cos(ang) * p.s * 2.9 * swirlF * speedF;
			let vy = Math.sin(ang) * p.s * 1.3 * swirlF * speedF + p.s * biasV * speedF;

			if (progress > 0) {
				const angA =
					Math.sin(p.x * 0.0022 + t * 0.12 + p.ph * 0.4) * 1.7 +
					Math.cos(p.y * 0.0026 - t * 0.09 + p.ph * 0.2) * 1.7 +
					Math.sin((p.x * 0.62 + p.y) * 0.0014 + t * 0.07 + depth) * 1.1;
				const vxA = Math.cos(angA) * p.s * 0.6;
				const vyA = Math.sin(angA) * p.s * 0.6 + p.s * 0.18;
				vx = vx * (1 - progress) + vxA * progress;
				vy = vy * (1 - progress) + vyA * progress;
			}

			const uw = userW * progress;
			if (uw > 0.0005 && gw > 0) {
				const cx = p.x < 0 ? 0 : p.x >= W ? W - 0.001 : p.x;
				const cy = p.y < 0 ? 0 : p.y >= H ? H - 0.001 : p.y;
				const gx = cx / CELL;
				const gy = cy / CELL;
				const i0 = gx | 0;
				const j0 = gy | 0;
				const i1 = i0 + 1 < gw ? i0 + 1 : gw - 1;
				const j1 = j0 + 1 < gh ? j0 + 1 : gh - 1;
				const tx = gx - i0;
				const ty = gy - j0;
				const r0 = j0 * gw;
				const r1 = j1 * gw;
				const c =
					(gCos[r0 + i0] * (1 - tx) + gCos[r0 + i1] * tx) * (1 - ty) +
					(gCos[r1 + i0] * (1 - tx) + gCos[r1 + i1] * tx) * ty;
				const s =
					(gSin[r0 + i0] * (1 - tx) + gSin[r0 + i1] * tx) * (1 - ty) +
					(gSin[r1 + i0] * (1 - tx) + gSin[r1 + i1] * tx) * ty;
				const vxU = c * p.s * 1.7;
				const vyU = s * p.s * 1.7;
				vx = vx * (1 - uw) + vxU * uw;
				vy = vy * (1 - uw) + vyU * uw;
			}

			p.x += vx * dt;
			p.y += vy * dt;
			if (p.x > W + 10) p.x = -10;
			if (p.x < -10) p.x = W + 10;
			if (p.y > H + 10) {
				p.y = -10;
				p.x = Math.random() * W;
			}
			if (p.y < -10) p.y = H + 10;

			p.nextFlip -= dt;
			if (p.nextFlip <= 0) {
				p.d = (Math.random() * 10) | 0;
				p.nextFlip = 60 + Math.random() * 240;
			}
		}

		function draw(p: Particle) {
			let g = (p.glow * (GLOWS - 1) + 0.5) | 0;
			if (g > GLOWS - 1) g = GLOWS - 1;
			if (g < 0) g = 0;
			const sp = sprites[p.d][p.si][g];
			ctx.drawImage(sp.c, p.x - sp.w / 2, p.y - sp.w / 2, sp.w, sp.w);
		}

		function particleTarget(): number {
			const T = TIERS[tier];
			return Math.min(T.cap, Math.floor((W * H) / T.ppp));
		}

		// Grow/shrink the particle pool to the current tier without a full reset.
		function syncParticles() {
			const target = particleTarget();
			if (particles.length > target) particles.length = target;
			else while (particles.length < target) particles.push(makeParticle());
		}

		// Apply the current tier: if the DPR cap changed, resize the backing store
		// and rebake sprites at the new resolution, then reconcile particle count.
		function applyTier() {
			const newDpr = Math.min(window.devicePixelRatio || 1, TIERS[tier].dprCap);
			if (newDpr !== dpr) {
				dpr = newDpr;
				canvas.width = W * dpr;
				canvas.height = H * dpr;
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
				bakeSprites();
				ctx.fillStyle = COLORS.bg;
				ctx.fillRect(0, 0, W, H);
			}
			syncParticles();
		}

		function resize() {
			W = window.innerWidth;
			H = window.innerHeight;
			canvas.width = W * dpr;
			canvas.height = H * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			buildMask();
			// Particle density follows the active quality tier (see TIERS).
			const target = particleTarget();
			particles = [];
			for (let i = 0; i < target; i++) particles.push(makeParticle());
			ctx.fillStyle = COLORS.bg;
			ctx.fillRect(0, 0, W, H);
			rebuildUserGrid();
			if (reduced) staticFrame();
			else warmup(500);
		}

		function onScroll() {
			progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * scrollRange)));
			depth = window.scrollY * 0.0006;
			const fade =
				progress < fadeStart
					? 1
					: 1 - (1 - ambient) * Math.min(1, (progress - fadeStart) / (1 - fadeStart));
			canvas.style.opacity = fade.toFixed(3);
		}

		function warmup(steps: number) {
			for (let k = 0; k < steps; k++) {
				t += 0.016;
				for (const p of particles) update(p, 1);
			}
		}

		function staticFrame() {
			progress = 0;
			warmup(700);
			ctx.fillStyle = COLORS.bg;
			ctx.fillRect(0, 0, W, H);
			for (const p of particles) draw(p);
		}

		let raf = 0;
		let resizePending = false;
		let last = performance.now();
		let tick = 0;
		// Runtime performance monitor. frameEMA is a smoothed measure of how long
		// the render work takes; slow/fastAccum bank wall-clock time spent over or
		// under budget so a tier change needs sustained evidence, not one spike.
		let frameEMA = 16.67;
		let slowAccum = 0;
		let fastAccum = 0;
		let tierFloor = 0; // best tier we're still allowed to promote back to
		let downAt = -1e9; // last demotion time (ms); gates promotions
		let upAt = -1e9; // last promotion time (ms); detects unstable promotions

		function monitor(now: number, rawMs: number) {
			const budget = TIERS[tier].renderEvery * 16.67;
			if (frameEMA > budget * 0.85) {
				slowAccum += rawMs;
				fastAccum = 0;
			} else if (frameEMA < budget * 0.45) {
				fastAccum += rawMs;
				slowAccum = 0;
			} else {
				slowAccum *= 0.9;
				fastAccum *= 0.9;
			}

			if (slowAccum > 1000 && tier < TIERS.length - 1) {
				// A promotion that unravels this fast means that tier is unstable on
				// this machine — floor it so we stop bouncing back into it.
				if (now - upAt < 8000) tierFloor = tier;
				tier++;
				downAt = now;
				slowAccum = fastAccum = 0;
				frameEMA = TIERS[tier].renderEvery * 16.67 * 0.5;
				applyTier();
			} else if (fastAccum > 4000 && tier > tierFloor && now - downAt > 10000) {
				tier--;
				upAt = now;
				slowAccum = fastAccum = 0;
				frameEMA = TIERS[tier].renderEvery * 16.67 * 0.5;
				applyTier();
			}
		}

		function frame(now: number) {
			raf = requestAnimationFrame(frame);
			if (!resizePending && (window.innerWidth !== W || window.innerHeight !== H)) {
				resize();
				onScroll();
			}
			tick++;
			if (tick % TIERS[tier].renderEvery !== 0) return;

			const rawMs = now - last;
			let dt = rawMs / 16.67;
			if (dt > 3) dt = 3;
			last = now;
			t += 0.016 * dt;
			const uTarget = userFn ? 1 : 0;
			userW += (uTarget - userW) * 0.05 * dt;
			if (userW < 0.0005) userW = uTarget === 0 ? 0 : userW;

			const workStart = performance.now();
			ctx.fillStyle = COLORS.trail;
			ctx.fillRect(0, 0, W, H);
			for (const p of particles) {
				update(p, dt);
				draw(p);
			}
			// Measure only the render work — immune to rAF throttling in background
			// tabs — and feed it to the tier monitor.
			frameEMA += (performance.now() - workStart - frameEMA) * 0.06;
			monitor(now, rawMs);
		}

		let resizeTimer: ReturnType<typeof setTimeout>;
		const onResize = () => {
			resizePending = true;
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				resizePending = false;
				resize();
				onScroll();
			}, 150);
		};

		applyUserFn = (fn) => {
			userFn = fn;
			if (fn) rebuildUserGrid();
			if (reduced) {
				userW = fn ? 1 : 0;
				staticFrame();
			}
		};

		const onScheme = () => {
			COLORS = themeColors();
			bakeSprites();
			canvas.style.backgroundColor = COLORS.bg;
			ctx.fillStyle = COLORS.bg;
			ctx.fillRect(0, 0, W, H);
			if (reduced) staticFrame();
		};

		lightMq.addEventListener('change', onScheme);
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onScroll, { passive: true });
		canvas.style.backgroundColor = COLORS.bg;
		resize();
		onScroll();
		if (!reduced) raf = requestAnimationFrame(frame);

		return () => {
			applyUserFn = () => {};
			cancelAnimationFrame(raf);
			clearTimeout(resizeTimer);
			lightMq.removeEventListener('change', onScheme);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
		pointer-events: none;
	}
</style>
