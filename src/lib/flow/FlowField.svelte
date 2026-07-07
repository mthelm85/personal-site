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
	const MAX_PARTICLES = 8000;

	// The field renders with WebGL2 instanced rendering: every digit is one
	// instance of a single quad, so the whole field is ONE draw call per frame
	// instead of thousands of Canvas2D drawImage calls. That removes the draw-call
	// bottleneck entirely, so integrated GPUs and phones run the full field at
	// 60fps — no runtime quality throttling needed. Digit glyphs live in a texture
	// atlas; glow is a per-instance brightness resolved in the fragment shader.
	const PART_VS = `#version 300 es
	layout(location=0) in vec2 aCorner;   // unit quad corner 0..1
	layout(location=1) in vec2 aPos;      // instance centre, CSS px
	layout(location=2) in float aSize;    // instance quad size, CSS px
	layout(location=3) in float aDigit;   // 0..9
	layout(location=4) in float aBright;  // 0..1 glow
	uniform vec2 uRes;                    // viewport, CSS px
	out vec2 vUv;
	out float vBright;
	void main() {
		vec2 px = aPos + (aCorner - 0.5) * aSize;
		vec2 clip = px / uRes * 2.0 - 1.0;
		gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
		float col = floor(aDigit + 0.5);
		vUv = vec2((col + aCorner.x) / 10.0, aCorner.y);
		vBright = aBright;
	}`;

	const PART_FS = `#version 300 es
	precision highp float;
	in vec2 vUv;
	in float vBright;
	uniform sampler2D uAtlas;
	uniform vec3 uRampLo, uRampHi;
	uniform float uALo, uAHi;
	out vec4 frag;
	void main() {
		float cov = texture(uAtlas, vUv).a;      // glyph coverage
		vec3 col = mix(uRampLo, uRampHi, vBright);
		float a = mix(uALo, uAHi, vBright) * cov;
		frag = vec4(col * a, a);                 // premultiplied alpha
	}`;

	// Full-screen quad that washes the previous frame toward the background,
	// producing the motion trails (the WebGL equivalent of a translucent fillRect).
	const FADE_VS = `#version 300 es
	layout(location=0) in vec2 aCorner;
	void main() { gl_Position = vec4(aCorner * 2.0 - 1.0, 0.0, 1.0); }`;

	const FADE_FS = `#version 300 es
	precision highp float;
	uniform vec3 uBg;
	uniform float uTrailA;
	out vec4 frag;
	void main() { frag = vec4(uBg * uTrailA, uTrailA); }`;

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
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		let sizeFactor = 1;

		const lightMq = window.matchMedia('(prefers-color-scheme: light)');

		// Numeric theme for the shaders: background, trail strength, and the digit
		// colour ramp endpoints (pale-on-dark or ink-on-light), all as 0..1 floats.
		function glTheme() {
			const light = lightMq.matches;
			let bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
			if (!/^#[0-9a-fA-F]{6}$/.test(bg)) bg = light ? '#fafaf8' : '#08080f';
			const br = parseInt(bg.slice(1, 3), 16);
			const bgn = parseInt(bg.slice(3, 5), 16);
			const bb = parseInt(bg.slice(5, 7), 16);
			const ramp = (k: number): [number, number, number, number] =>
				light
					? [140 - k * 105, 148 - k * 78, 168 - k * 43, 0.3 + k * 0.45]
					: [100 + k * 60, 122 + k * 70, 150 + k * 65, 0.28 + k * 0.38];
			const lo = ramp(0);
			const hi = ramp(1);
			return {
				bgHex: bg,
				bg: [br / 255, bgn / 255, bb / 255] as [number, number, number],
				trailA: 0.32,
				rampLo: [lo[0] / 255, lo[1] / 255, lo[2] / 255] as [number, number, number],
				aLo: lo[3],
				rampHi: [hi[0] / 255, hi[1] / 255, hi[2] / 255] as [number, number, number],
				aHi: hi[3]
			};
		}

		// --- WebGL resources -------------------------------------------------
		let gl!: WebGL2RenderingContext;
		let partProg!: WebGLProgram;
		let fadeProg!: WebGLProgram;
		let quadBuf!: WebGLBuffer;
		let instBuf!: WebGLBuffer;
		let partVao!: WebGLVertexArrayObject;
		let fadeVao!: WebGLVertexArrayObject;
		let atlasTex: WebGLTexture | null = null;
		let uResLoc: WebGLUniformLocation | null;
		let uRampLoLoc: WebGLUniformLocation | null;
		let uRampHiLoc: WebGLUniformLocation | null;
		let uALoLoc: WebGLUniformLocation | null;
		let uAHiLoc: WebGLUniformLocation | null;
		let uBgLoc: WebGLUniformLocation | null;
		let uTrailALoc: WebGLUniformLocation | null;
		let bgCol: [number, number, number] = [0, 0, 0];
		let bgHex = '#000';
		const instanceData = new Float32Array(MAX_PARTICLES * 5);

		function createProgram(vsSrc: string, fsSrc: string): WebGLProgram {
			const vs = gl.createShader(gl.VERTEX_SHADER)!;
			gl.shaderSource(vs, vsSrc);
			gl.compileShader(vs);
			const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
			gl.shaderSource(fs, fsSrc);
			gl.compileShader(fs);
			const p = gl.createProgram()!;
			gl.attachShader(p, vs);
			gl.attachShader(p, fs);
			gl.linkProgram(p);
			if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
				console.error(
					'FlowField shader link failed:',
					gl.getProgramInfoLog(p),
					gl.getShaderInfoLog(vs),
					gl.getShaderInfoLog(fs)
				);
			}
			gl.deleteShader(vs);
			gl.deleteShader(fs);
			return p;
		}

		function buildAtlas() {
			// Digits 0-9 baked white into a 10-cell strip; the shader tints them.
			// Bake at the largest on-screen glyph's DEVICE size so the GPU barely has
			// to minify it — minifying a big glyph down to ~10px thins the strokes
			// (they look skinnier). Rebuilt on resize since the size tracks the screen.
			const cell = Math.max(16, Math.round(SIZES[SIZES.length - 1] * sizeFactor * 1.5 * dpr));
			const off = document.createElement('canvas');
			off.width = cell * 10;
			off.height = cell;
			const octx = off.getContext('2d')!;
			octx.clearRect(0, 0, off.width, off.height);
			octx.fillStyle = '#fff';
			octx.font = `400 ${Math.round(cell * 0.7)}px 'JetBrains Mono', Consolas, monospace`;
			octx.textAlign = 'center';
			octx.textBaseline = 'middle';
			for (let d = 0; d < 10; d++) octx.fillText(String(d), d * cell + cell / 2, cell / 2);
			if (!atlasTex) atlasTex = gl.createTexture()!;
			gl.bindTexture(gl.TEXTURE_2D, atlasTex);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}

		function applyThemeUniforms() {
			const T = glTheme();
			bgCol = T.bg;
			bgHex = T.bgHex;
			gl.useProgram(partProg);
			gl.uniform3fv(uRampLoLoc, T.rampLo);
			gl.uniform3fv(uRampHiLoc, T.rampHi);
			gl.uniform1f(uALoLoc, T.aLo);
			gl.uniform1f(uAHiLoc, T.aHi);
			gl.useProgram(fadeProg);
			gl.uniform3fv(uBgLoc, T.bg);
			gl.uniform1f(uTrailALoc, T.trailA);
		}

		function initGL(): boolean {
			const g = canvas.getContext('webgl2', {
				alpha: true,
				premultipliedAlpha: true,
				preserveDrawingBuffer: true, // keep the frame so trails accumulate
				antialias: false
			});
			if (!g) return false;
			gl = g;
			atlasTex = null; // fresh context (incl. after loss) — force a rebuild

			partProg = createProgram(PART_VS, PART_FS);
			fadeProg = createProgram(FADE_VS, FADE_FS);

			uResLoc = gl.getUniformLocation(partProg, 'uRes');
			uRampLoLoc = gl.getUniformLocation(partProg, 'uRampLo');
			uRampHiLoc = gl.getUniformLocation(partProg, 'uRampHi');
			uALoLoc = gl.getUniformLocation(partProg, 'uALo');
			uAHiLoc = gl.getUniformLocation(partProg, 'uAHi');
			gl.useProgram(partProg);
			gl.uniform1i(gl.getUniformLocation(partProg, 'uAtlas'), 0);
			uBgLoc = gl.getUniformLocation(fadeProg, 'uBg');
			uTrailALoc = gl.getUniformLocation(fadeProg, 'uTrailA');

			quadBuf = gl.createBuffer()!;
			gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

			instBuf = gl.createBuffer()!;
			gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
			gl.bufferData(gl.ARRAY_BUFFER, MAX_PARTICLES * 5 * 4, gl.DYNAMIC_DRAW);

			const stride = 20; // 5 floats
			partVao = gl.createVertexArray()!;
			gl.bindVertexArray(partVao);
			gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
			gl.enableVertexAttribArray(0);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
			gl.enableVertexAttribArray(1);
			gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
			gl.vertexAttribDivisor(1, 1);
			gl.enableVertexAttribArray(2);
			gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 8);
			gl.vertexAttribDivisor(2, 1);
			gl.enableVertexAttribArray(3);
			gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 12);
			gl.vertexAttribDivisor(3, 1);
			gl.enableVertexAttribArray(4);
			gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 16);
			gl.vertexAttribDivisor(4, 1);

			fadeVao = gl.createVertexArray()!;
			gl.bindVertexArray(fadeVao);
			gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
			gl.enableVertexAttribArray(0);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			gl.bindVertexArray(null);

			// The atlas is (re)built in resize(), which runs right after this. Re-bake
			// once the web font loads too, in case it wasn't ready at startup.
			document.fonts?.ready.then(() => {
				if (gl && !gl.isContextLost()) buildAtlas();
			});

			gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied "over"
			applyThemeUniforms();
			return true;
		}

		function glClearBg() {
			gl.clearColor(bgCol[0], bgCol[1], bgCol[2], 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}

		function glFade() {
			gl.useProgram(fadeProg);
			gl.bindVertexArray(fadeVao);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}

		function glParticles() {
			const n = particles.length;
			if (n === 0 || !atlasTex) return;
			let o = 0;
			for (let i = 0; i < n; i++) {
				const p = particles[i];
				instanceData[o++] = p.x;
				instanceData[o++] = p.y;
				instanceData[o++] = SIZES[p.si] * sizeFactor * 1.5;
				instanceData[o++] = p.d;
				let b = p.glow;
				b = b < 0 ? 0 : b > 1 ? 1 : b;
				instanceData[o++] = b;
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceData, 0, n * 5);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, atlasTex);
			gl.useProgram(partProg);
			gl.uniform2f(uResLoc, W, H);
			gl.bindVertexArray(partVao);
			gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
		}

		// --- Simulation ------------------------------------------------------
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
			const inside = dwellOn && xi >= 0 && xi < W && yi >= 0 && yi < H ? mask[yi * W + xi] : 0;

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

		function particleTarget(): number {
			return Math.min(MAX_PARTICLES, Math.floor((W * H) / 200));
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
			gl.viewport(0, 0, canvas.width, canvas.height);
			computeSizeFactor();
			buildAtlas(); // re-bake digits at the screen-appropriate resolution
			buildMask();
			const target = particleTarget();
			particles = [];
			for (let i = 0; i < target; i++) particles.push(makeParticle());
			glClearBg();
			rebuildUserGrid();
			if (reduced) staticFrame();
			else warmup(500);
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
			glClearBg();
			glParticles();
		}

		// --- Presentation / loop --------------------------------------------
		let raf = 0;
		let resizePending = false;
		let last = performance.now();
		const FADE_MS = 700; // brief intro fade-in for polish
		let introStart = 0;
		let introFade = reduced ? 1 : 0;
		let scrollFade = 1;

		function applyOpacity() {
			canvas.style.opacity = (scrollFade * introFade).toFixed(3);
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

		function frame(now: number) {
			raf = requestAnimationFrame(frame);
			if (!resizePending && (window.innerWidth !== W || window.innerHeight !== H)) {
				resize();
				onScroll();
				last = now;
			}

			// ~60fps cap: bounds work and keeps the trail look identical on
			// high-refresh panels (the trail fade is per-frame).
			if (now - last < 16.67 - 3) return;

			let dt = (now - last) / 16.67;
			if (dt > 3) dt = 3;
			last = now;
			t += 0.016 * dt;
			const uTarget = userFn ? 1 : 0;
			userW += (uTarget - userW) * 0.05 * dt;
			if (userW < 0.0005) userW = uTarget === 0 ? 0 : userW;

			for (const p of particles) update(p, dt);
			glFade();
			glParticles();

			if (!introStart) introStart = now;
			if (introFade < 1) {
				introFade = Math.min(1, (now - introStart) / FADE_MS);
				applyOpacity();
			}
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
			applyThemeUniforms();
			canvas.style.backgroundColor = bgHex;
			glClearBg();
			if (reduced) staticFrame();
		};

		const onLost = (e: Event) => {
			e.preventDefault();
			cancelAnimationFrame(raf);
		};
		const onRestored = () => {
			if (!initGL()) return;
			resize();
			onScroll();
			if (!reduced) {
				last = performance.now();
				raf = requestAnimationFrame(frame);
			}
		};

		// --- Boot ------------------------------------------------------------
		if (!initGL()) {
			// No WebGL2 (very rare): leave the dark background, no animation.
			canvas.style.backgroundColor = glTheme().bgHex;
			return;
		}

		canvas.addEventListener('webglcontextlost', onLost, false);
		canvas.addEventListener('webglcontextrestored', onRestored, false);
		lightMq.addEventListener('change', onScheme);
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onScroll, { passive: true });
		canvas.style.backgroundColor = bgHex;
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
			canvas.removeEventListener('webglcontextlost', onLost);
			canvas.removeEventListener('webglcontextrestored', onRestored);
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
