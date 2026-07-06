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

	// Base digit sizes at a reference viewport; the actual sizes are these scaled
	// by a screen-size factor (see sizeFactor) so "Matt Helm" stays legible on
	// small screens and reads comfortably on large ones.
	const SIZES = [6, 8, 10];
	const GLOWS = 6;

	// Performance strategy — three decoupled levers, no resolution change (so
	// digits are always crisp) and no loader:
	//   • SIZE is set purely from the screen size, once (legibility).
	//   • COUNT is eased DOWN, one-way, only when the machine shows sustained jank
	//     (median-gated, after a grace period so startup churn doesn't count).
	//     Culled digits fade out — never a hard pop — so there is no flicker.
	//   • DWELL time grows as the field thins, so the fewer remaining digits linger
	//     longer on the "Matt Helm" mask and keep the name dense even when the
	//     ambient background gets sparse.
	// Net: capable machines stay full; weak ones smoothly self-optimise over the
	// first few seconds, keeping the name legible throughout.
	const Q_MIN = 0.16; // never drop below 16% of the base particle count
	const Q_STEP = 0.12; // fraction shed per reduction step
	const DWELL_MAX = 2.75; // cap on the dwell-time multiplier

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

		// Canvas resolution is fixed for the whole session (never resized) so digits
		// are always crisp. `q` is the current particle-count quality (1 = full),
		// eased down only when needed. `sizeFactor` scales digit size to the screen
		// and `dwellScale` grows as `q` falls to keep the name dense.
		let q = 1;
		let sizeFactor = 1;
		let dwellScale = 1;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
						const fs = SIZES[si] * sizeFactor;
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
			fade: number; // 1 = fully visible; ramps to 0 when culled on a reduction
			retiring: boolean; // marked for removal once its fade reaches 0
		}

		let W = 0;
		let H = 0;
		let mask = new Uint8Array(0);
		let particles: Particle[] = [];
		let retiringCount = 0; // how many particles are currently fading out
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
				nextFlip: Math.random() * 200,
				fade: 1,
				retiring: false
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

			// Dwell grows as the field thins (dwellScale ≥ 1), so fewer digits still
			// keep the "Matt Helm" mask densely populated.
			if (inside && !p.wasInside) p.dwell = (360 + Math.random() * 480) * dwellScale;
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

			if (p.retiring) p.fade -= 0.03 * dt; // gentle ~0.55s dissolve on a reduction
		}

		function draw(p: Particle) {
			let g = (p.glow * (GLOWS - 1) + 0.5) | 0;
			if (g > GLOWS - 1) g = GLOWS - 1;
			if (g < 0) g = 0;
			const sp = sprites[p.d][p.si][g];
			if (p.fade < 1) {
				ctx.globalAlpha = p.fade > 0 ? p.fade : 0;
				ctx.drawImage(sp.c, p.x - sp.w / 2, p.y - sp.w / 2, sp.w, sp.w);
				ctx.globalAlpha = 1;
			} else {
				ctx.drawImage(sp.c, p.x - sp.w / 2, p.y - sp.w / 2, sp.w, sp.w);
			}
		}

		function particleTarget(): number {
			const base = Math.min(8000, Math.floor((W * H) / 200));
			return Math.floor(base * q);
		}

		// One-way quality reduction: lower q, grow the dwell multiplier to keep the
		// name dense, and fade out the now-excess particles (draw() ramps their
		// alpha; frame() removes them once invisible). Never a hard pop, never a
		// resolution or sprite change — so no flicker.
		function reduceQuality() {
			q = Math.max(Q_MIN, q - Q_STEP);
			dwellScale = Math.min(DWELL_MAX, 1 / q);
			const target = particleTarget();
			for (let i = target; i < particles.length; i++) {
				if (!particles[i].retiring) {
					particles[i].retiring = true;
					retiringCount++;
				}
			}
		}

		// Digit size tracks the smaller screen dimension so "Matt Helm" stays
		// legible on phones and reads comfortably on large displays.
		function computeSizeFactor() {
			const vmin = Math.min(W, H);
			sizeFactor = Math.min(1.15, Math.max(0.6, vmin / 950));
		}

		function resize() {
			W = window.innerWidth;
			H = window.innerHeight;
			canvas.width = W * dpr;
			canvas.height = H * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			computeSizeFactor();
			bakeSprites(); // re-bake digits at the screen-appropriate size
			buildMask();
			const target = particleTarget();
			particles = [];
			retiringCount = 0;
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
			scrollFade =
				progress < fadeStart
					? 1
					: 1 - (1 - ambient) * Math.min(1, (progress - fadeStart) / (1 - fadeStart));
			applyOpacity();
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

		// One-way, median-gated quality reducer. We measure the real inter-frame
		// interval and, only after a grace period (so page-load churn doesn't
		// count), shed digits whenever a robust MEDIAN of recent frames is over
		// budget. It only ever reduces — never restores — so it converges within a
		// few seconds and never pulses. A short cooldown after each step lets the
		// fade finish and the median re-measure the lighter config before deciding
		// again, which prevents overshoot. renderEvery drops to 2 (≈30fps) only as a
		// last resort once particle count is already at the floor.
		const GRACE_MS = 1500; // ignore this much startup churn before reducing
		const STEP_COOLDOWN = 700; // settle time after a reduction before the next
		const JANK = 1.2; // median over budget × this ⇒ shed (≈ below 50fps)
		const FADE_MS = 700; // brief intro fade-in (does NOT hide the adaptation)

		let renderEvery = 1;
		let started = 0;
		let lastStepAt = -1e9;
		let medBuf: number[] = [];
		let introStart = 0;
		let introFade = reduced ? 1 : 0;
		let scrollFade = 1;

		function applyOpacity() {
			canvas.style.opacity = (scrollFade * introFade).toFixed(3);
		}

		function median(a: number[]): number {
			const s = [...a].sort((x, y) => x - y);
			return s[s.length >> 1];
		}

		function monitor(now: number, rawMs: number) {
			if (document.hidden || rawMs >= 1000) return; // ignore tab-switch / huge gaps
			medBuf.push(rawMs);
			if (medBuf.length > 24) medBuf.shift();

			if (now - started < GRACE_MS) return; // let startup churn pass
			if (now - lastStepAt < STEP_COOLDOWN) return; // let the last step settle
			if (medBuf.length < 16) return;

			const budget = renderEvery * 16.67;
			if (median(medBuf) <= budget * JANK) return; // smooth enough — stop reducing

			if (q > Q_MIN) reduceQuality();
			else if (renderEvery === 1) renderEvery = 2; // last resort: halve the framerate
			else return; // already at the floor
			lastStepAt = now;
			medBuf = []; // re-measure the new, lighter config from scratch
		}

		function frame(now: number) {
			raf = requestAnimationFrame(frame);
			if (!resizePending && (window.innerWidth !== W || window.innerHeight !== H)) {
				resize();
				onScroll();
				last = now; // don't charge the blocking resize/warmup as a slow frame
			}

			// Cap the render rate: ~60fps at renderEvery 1, ~30fps at renderEvery 2.
			// Bounds workload and keeps the trail look identical on high-refresh panels.
			if (now - last < renderEvery * 16.67 - 3) return;

			const rawMs = now - last;
			let dt = rawMs / 16.67;
			if (dt > 3) dt = 3;
			last = now;
			t += 0.016 * dt;
			const uTarget = userFn ? 1 : 0;
			userW += (uTarget - userW) * 0.05 * dt;
			if (userW < 0.0005) userW = uTarget === 0 ? 0 : userW;

			ctx.fillStyle = COLORS.trail;
			ctx.fillRect(0, 0, W, H);
			for (const p of particles) {
				update(p, dt);
				draw(p);
			}
			if (retiringCount > 0) {
				const before = particles.length;
				particles = particles.filter((p) => !(p.retiring && p.fade <= 0));
				retiringCount -= before - particles.length;
			}

			// Brief intro fade-in for polish (the adaptation that follows is visible).
			if (!introStart) introStart = now;
			if (introFade < 1) {
				introFade = Math.min(1, (now - introStart) / FADE_MS);
				applyOpacity();
			}

			if (!started) started = now;
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
		if (!reduced) {
			last = performance.now();
			raf = requestAnimationFrame(frame);
		}

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
