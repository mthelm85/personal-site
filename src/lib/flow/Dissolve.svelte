<script lang="ts">
	import { onMount } from 'svelte';
	import { ambientAngle } from './ambient';

	// Content dissolving into the flow field.
	//
	// Elements marked [data-dissolve] dissolve one row of text at a time as they
	// scroll up through a line near the top of the viewport. When a row's middle
	// crosses the line, the whole row is hidden at once and its characters burst
	// into digits at their exact spots over a few frames. Each digit rides up
	// with the page for a moment, then shrinks, dims and drifts off on the same
	// ambient current the background field uses. Rows are the unit so a row is
	// always either fully visible or fully gone: the mask edge sits in the gap
	// between rows and can never cut through letters, wherever scrolling stops.
	//
	// data-dissolve="whole" (project cards) makes the whole block one unit: it
	// stays intact until the line is data-dissolve-at (0..1) of the way down it,
	// then pops all at once, its outline traced in digits too. Slicing a card
	// row by row left a lidless box behind, which looked broken.
	//
	// Drawn on its own transparent canvas ABOVE the content: the background field
	// canvas sits behind the page at ~30% opacity, so digits drawn there would be
	// faint and hidden under cards. One WebGL2 instanced draw call, like the field.

	/** Distance of the dissolve line from the top of the viewport, CSS px. Must
	 *  stay above where nav jumps land section headings (89px, 55px mobile). */
	const LINE = 48;
	/** A converted row comes back once its middle is this far below the line
	 *  again (hysteresis, so jiggling the scroll doesn't flicker or re-emit). */
	const REARM = 24;
	/** Characters in a row burst out over up to this many frames (~150ms) */
	const BURST_FRAMES = 9;
	/** "whole" blocks: spacing and size of the digits traced along the outline */
	const OUTLINE_STEP = 14;
	const OUTLINE_SIZE = 12;
	/** Emit a digit for every Nth character */
	const STRIDE = 2;
	/** Frames a digit lives (~1.5s at 60fps) */
	const LIFE = 90;
	const MAX_DIGITS = 1500;
	/** A line jump bigger than this in one frame (nav link, fast flick) hides
	 *  the text without emitting, so jumps don't burst into confetti. */
	const MAX_EMIT_STEP = 220;

	let canvas: HTMLCanvasElement;

	const VS = `#version 300 es
	layout(location=0) in vec2 aCorner;
	layout(location=1) in vec2 aPos;
	layout(location=2) in float aSize;
	layout(location=3) in float aDigit;
	layout(location=4) in float aBright;
	layout(location=5) in float aAlpha;
	uniform vec2 uRes;
	out vec2 vUv;
	out float vBright;
	out float vAlpha;
	void main() {
		vec2 px = aPos + (aCorner - 0.5) * aSize;
		vec2 clip = px / uRes * 2.0 - 1.0;
		gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
		float col = floor(aDigit + 0.5);
		vUv = vec2((col + aCorner.x) / 10.0, aCorner.y);
		vBright = aBright;
		vAlpha = aAlpha;
	}`;

	const FS = `#version 300 es
	precision highp float;
	in vec2 vUv;
	in float vBright;
	in float vAlpha;
	uniform sampler2D uAtlas;
	uniform vec3 uLo, uHi;
	out vec4 frag;
	void main() {
		float cov = texture(uAtlas, vUv).a;
		vec3 col = mix(uLo, uHi, vBright);
		float a = vAlpha * cov;
		frag = vec4(col * a, a);
	}`;

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const targets = [...document.querySelectorAll<HTMLElement>('[data-dissolve]')];
		if (!targets.length) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const lightMq = window.matchMedia('(prefers-color-scheme: light)');

		// --- Character layout cache (element-local, measured once) -----------
		interface Glyph {
			x: number; // centre, relative to the element's left edge
			y: number; // centre, relative to the element's top edge
			size: number; // font size, px
		}
		/** One rendered row of text, in element-local coordinates */
		interface Row {
			top: number;
			bottom: number;
			mid: number;
			glyphs: Glyph[]; // the sampled characters that become digits
			converted: boolean;
		}
		interface Target {
			el: HTMLElement;
			rows: Row[];
			height: number;
			prevLine: number | null; // line position in element coords last frame
			maskEdge: number | null; // current mask edge, element coords (null = no mask)
		}
		const tracked: Target[] = targets.map((el) => ({
			el,
			rows: [],
			height: 0,
			prevLine: null,
			maskEdge: null
		}));

		function measure(t: Target) {
			const box = t.el.getBoundingClientRect();
			const range = document.createRange();
			const walker = document.createTreeWalker(t.el, NodeFilter.SHOW_TEXT);
			const rows: Row[] = [];
			let n = 0;
			for (let node: Node | null; (node = walker.nextNode()); ) {
				const text = node.textContent ?? '';
				const size = parseFloat(getComputedStyle(node.parentElement!).fontSize) || 16;
				for (let i = 0; i < text.length; i++) {
					if (/\s/.test(text[i])) continue;
					range.setStart(node, i);
					range.setEnd(node, i + 1);
					const r = range.getBoundingClientRect();
					if (!r.width) continue;
					const top = r.top - box.top;
					const bottom = r.bottom - box.top;
					// Group into rows: a character belongs to a row it overlaps
					// vertically by more than half its height.
					let row = rows.find((w) => Math.min(w.bottom, bottom) - Math.max(w.top, top) > r.height / 2);
					if (!row) {
						row = { top, bottom, mid: 0, glyphs: [], converted: false };
						rows.push(row);
					}
					row.top = Math.min(row.top, top);
					row.bottom = Math.max(row.bottom, bottom);
					if (n++ % STRIDE === 0) {
						row.glyphs.push({ x: r.left + r.width / 2 - box.left, y: (top + bottom) / 2, size });
					}
				}
			}
			// Chips draw a border well above and below their text: widen the row
			// to the chip's full box so the mask edge never slices a chip.
			for (const chip of t.el.querySelectorAll<HTMLElement>('.chip')) {
				const r = chip.getBoundingClientRect();
				const top = r.top - box.top;
				const bottom = r.bottom - box.top;
				const row = rows.find((w) => Math.min(w.bottom, bottom) - Math.max(w.top, top) > 0);
				if (row) {
					row.top = Math.min(row.top, top);
					row.bottom = Math.max(row.bottom, bottom);
				}
			}
			rows.sort((a, b) => a.top - b.top);
			for (const w of rows) w.mid = (w.top + w.bottom) / 2;
			t.height = box.height;

			// data-dissolve="whole": the block is one unit (project cards). It stays
			// intact until the line is data-dissolve-at of the way down it, then
			// all of it pops at once — its text plus digits traced along its
			// outline, so the card's shape flashes up in numbers.
			if (t.el.dataset.dissolve === 'whole') {
				const at = parseFloat(t.el.dataset.dissolveAt ?? '') || 0.5;
				const glyphs = rows.flatMap((w) => w.glyphs);
				const w = box.width;
				const h = box.height;
				const perimeter = 2 * (w + h);
				for (let d = 0; d < perimeter; d += OUTLINE_STEP) {
					const [x, y] = d < w ? [d, 0] : d < w + h ? [w, d - w] : d < 2 * w + h ? [w - (d - w - h), h] : [0, h - (d - 2 * w - h)];
					glyphs.push({ x, y, size: OUTLINE_SIZE });
				}
				t.rows = [{ top: 0, bottom: h, mid: at * h, glyphs, converted: false }];
				return;
			}
			t.rows = rows;
		}
		const measureAll = () => tracked.forEach(measure);

		// --- Mask: hide converted rows -------------------------------------
		// The edge goes halfway into the gap below the last converted row, so it
		// never cuts through letters. No mask at all while nothing is converted
		// (a mask at rest would clip overhanging descendants, as with the tilted
		// cards).
		function updateMask(t: Target) {
			let edge: number | null = null;
			for (let i = 0; i < t.rows.length; i++) {
				if (!t.rows[i].converted) break;
				const next = t.rows[i + 1];
				edge = next ? (t.rows[i].bottom + next.top) / 2 : t.height + 1;
			}
			if (edge === t.maskEdge) return;
			t.maskEdge = edge;
			t.el.style.maskImage =
				edge === null ? '' : `linear-gradient(to bottom, transparent ${edge}px, #000 ${edge}px)`;
		}

		// --- WebGL ------------------------------------------------------------
		const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
		let prog: WebGLProgram | null = null;
		let uRes: WebGLUniformLocation | null = null;
		let uLo: WebGLUniformLocation | null = null;
		let uHi: WebGLUniformLocation | null = null;
		let instBuf: WebGLBuffer | null = null;
		let vao: WebGLVertexArrayObject | null = null;
		let atlas: WebGLTexture | null = null;
		const FLOATS = 6;
		const inst = new Float32Array(MAX_DIGITS * FLOATS);

		function compile(type: number, src: string) {
			const sh = gl!.createShader(type)!;
			gl!.shaderSource(sh, src);
			gl!.compileShader(sh);
			return sh;
		}

		function bakeAtlas() {
			if (!gl) return;
			// Bake at the largest starting size (headings) so big digits stay crisp.
			const maxSize = Math.max(
				16,
				...tracked.flatMap((t) => t.rows.flatMap((w) => w.glyphs.map((g) => g.size)))
			);
			const cell = Math.min(128, Math.round(maxSize * dpr));
			const off = document.createElement('canvas');
			off.width = cell * 10;
			off.height = cell;
			const c = off.getContext('2d')!;
			c.fillStyle = '#fff';
			c.font = `400 ${Math.round(cell * 0.75)}px 'Share Tech Mono', monospace`;
			c.textAlign = 'center';
			c.textBaseline = 'middle';
			for (let d = 0; d < 10; d++) c.fillText(String(d), d * cell + cell / 2, cell / 2);
			if (!atlas) atlas = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, atlas);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}

		function applyTheme() {
			if (!gl || !prog) return;
			const css = getComputedStyle(document.documentElement);
			const hex = (name: string, fb: string) => {
				const v = css.getPropertyValue(name).trim();
				return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fb;
			};
			const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
			const light = lightMq.matches;
			gl.useProgram(prog);
			// Born at text colour, settling to the field's digit colour.
			gl.uniform3fv(uLo, rgb(hex('--color-flow-lo', light ? '#a8a5e2' : '#5a598f')));
			gl.uniform3fv(uHi, rgb(hex('--color-text-primary', light ? '#1c1b1f' : '#e5e1e6')));
		}

		if (gl) {
			prog = gl.createProgram()!;
			gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
			gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
			gl.linkProgram(prog);
			if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
				console.error('Dissolve shader link failed:', gl.getProgramInfoLog(prog));
			}
			uRes = gl.getUniformLocation(prog, 'uRes');
			uLo = gl.getUniformLocation(prog, 'uLo');
			uHi = gl.getUniformLocation(prog, 'uHi');
			gl.useProgram(prog);
			gl.uniform1i(gl.getUniformLocation(prog, 'uAtlas'), 0);

			const quad = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quad);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
			instBuf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
			gl.bufferData(gl.ARRAY_BUFFER, inst.byteLength, gl.DYNAMIC_DRAW);

			vao = gl.createVertexArray();
			gl.bindVertexArray(vao);
			gl.bindBuffer(gl.ARRAY_BUFFER, quad);
			gl.enableVertexAttribArray(0);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
			const stride = FLOATS * 4;
			const attr = (loc: number, size: number, offset: number) => {
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4);
				gl.vertexAttribDivisor(loc, 1);
			};
			attr(1, 2, 0); // pos
			attr(2, 1, 2); // size
			attr(3, 1, 3); // digit
			attr(4, 1, 4); // bright
			attr(5, 1, 5); // alpha
			gl.bindVertexArray(null);

			gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			applyTheme();
		}

		// --- Digits -----------------------------------------------------------
		interface Digit {
			x: number;
			y: number;
			vx: number; // small random kick at birth, decays as it rides
			vy: number;
			size0: number;
			d: number;
			ph: number;
			s: number;
			age: number;
			nextFlip: number;
		}
		let digits: Digit[] = [];
		let t = 0;
		let W = 0;
		let H = 0;

		function resize() {
			W = window.innerWidth;
			H = window.innerHeight;
			canvas.width = W * dpr;
			canvas.height = H * dpr;
			gl?.viewport(0, 0, canvas.width, canvas.height);
			measureAll();
			bakeAtlas();
		}

		/** Birth a digit for one character. A random negative age staggers the
		 *  row's burst over BURST_FRAMES; until it is born the digit is invisible
		 *  but still rides the scroll, so it appears where its letter was. */
		function emit(x: number, y: number, size: number) {
			if (digits.length >= MAX_DIGITS) return;
			digits.push({
				x: x + (Math.random() - 0.5) * size * 0.4,
				y: y + (Math.random() - 0.5) * size * 0.5,
				vx: (Math.random() - 0.5) * 1.2,
				vy: -Math.random() * 0.8,
				size0: size * 0.95,
				d: (Math.random() * 10) | 0,
				ph: Math.random() * Math.PI * 2,
				s: 0.6 + Math.random() * 1.3,
				age: -Math.random() * BURST_FRAMES,
				nextFlip: 6 + Math.random() * 20
			});
		}

		// --- Loop ---------------------------------------------------------------
		let raf = 0;
		let lastScroll = window.scrollY;
		let last = performance.now();

		function frame(now: number) {
			raf = requestAnimationFrame(frame);
			let dt = (now - last) / 16.67;
			last = now;
			if (dt > 2) dt = 2;
			t += 0.016 * dt;

			const scrollDelta = window.scrollY - lastScroll;
			lastScroll = window.scrollY;
			const depth = window.scrollY * 0.0006;

			// 1. Convert rows whose middle has crossed the line; hide them
			for (const tr of tracked) {
				const box = tr.el.getBoundingClientRect();
				const lineLocal = LINE - box.top; // where the line falls inside the element
				const prev = tr.prevLine;
				tr.prevLine = lineLocal;
				const step = prev === null ? 0 : lineLocal - prev;

				for (const row of tr.rows) {
					if (row.converted) {
						// comes back whole once it is well below the line again
						if (row.mid > lineLocal + REARM) row.converted = false;
						continue;
					}
					if (row.mid > lineLocal) continue;
					row.converted = true;
					// Emit only for a genuine crossing during a normal scroll step:
					// rows a nav jump or fast flick skips over just disappear.
					if (gl && prev !== null && step > 0 && step <= MAX_EMIT_STEP && row.mid > prev) {
						for (const g of row.glyphs) {
							// skip parts already scrolled off-screen: nobody sees them
							if (box.top + g.y > -g.size) emit(box.left + g.x, box.top + g.y, g.size);
						}
					}
				}
				updateMask(tr);
			}

			if (!gl || !prog) return;

			// 2. Move digits: ride the scroll at first, then join the ambient
			//    current (same formula as the background field's content area).
			let n = 0;
			for (let i = 0; i < digits.length; i++) {
				const p = digits[i];
				p.age += dt;
				if (p.age >= LIFE) continue;
				if (p.age < 0) {
					// not born yet: ride with the page, invisible
					p.y -= scrollDelta;
					digits[n++] = p;
					const o = (n - 1) * FLOATS;
					inst[o] = p.x;
					inst[o + 1] = p.y;
					inst[o + 2] = 0;
					inst[o + 3] = p.d;
					inst[o + 4] = 0;
					inst[o + 5] = 0;
					continue;
				}
				const k = p.age / LIFE; // 0 → 1
				const ride = Math.max(0, 1 - k * 2.5); // stuck to the page early on
				const angA = ambientAngle(p.x, p.y, t, p.ph, depth);
				const flow = 1 - ride;
				p.x += (Math.cos(angA) * p.s * 1.2 * flow + p.vx * ride) * dt;
				p.y += ((Math.sin(angA) * p.s * 1.2 + p.s * 0.3) * flow + p.vy * ride) * dt - scrollDelta * ride;
				p.nextFlip -= dt;
				if (p.nextFlip <= 0) {
					p.d = (Math.random() * 10) | 0;
					p.nextFlip = 6 + Math.random() * 30;
				}
				digits[n++] = p;

				const ease = 1 - (1 - k) * (1 - k);
				const o = (n - 1) * FLOATS;
				inst[o] = p.x;
				inst[o + 1] = p.y;
				inst[o + 2] = p.size0 + (9 - p.size0) * ease; // shrink to field digit size
				inst[o + 3] = p.d;
				inst[o + 4] = 1 - ease; // text colour → field colour
				inst[o + 5] = 0.9 * Math.pow(1 - k, 1.4); // fade out
			}
			digits.length = n;

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			if (!n || !atlas) return;
			gl.useProgram(prog);
			gl.uniform2f(uRes, W, H);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, atlas);
			gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst, 0, n * FLOATS);
			gl.bindVertexArray(vao);
			gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
		}

		// Layout changes (wrapping, fonts) move characters: re-measure.
		const ro = new ResizeObserver(() => measureAll());
		tracked.forEach((tr) => ro.observe(tr.el));
		const onResize = () => resize();
		window.addEventListener('resize', onResize);
		lightMq.addEventListener('change', applyTheme);
		document.fonts?.ready.then(() => {
			measureAll();
			bakeAtlas();
		});

		resize();
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			window.removeEventListener('resize', onResize);
			lightMq.removeEventListener('change', applyTheme);
			tracked.forEach((tr) => (tr.el.style.maskImage = ''));
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	/* Above the content (main is z-index 10), below the nav (50) */
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		z-index: 20;
		pointer-events: none;
	}
</style>
