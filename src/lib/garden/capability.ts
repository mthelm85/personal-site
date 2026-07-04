/**
 * Capability probe — decides the rendering tier on first load.
 *
 * Tiers (see docs/garden-plan.md):
 *  - 'full'    everything
 *  - 'reduced' lower density, no shadows, capped DPR, shorter draw distance
 *  - 'none'    no usable WebGL2 → flat fallback (/plain at M6)
 *
 * Manual override: `?tier=full|reduced|none` (persisted) or `?tier=auto`
 * (clears). Persisted overrides live in localStorage under `garden:tier`.
 */

export type Tier = 'full' | 'reduced' | 'none';

export interface CapabilityReport {
	tier: Tier;
	/** Human-readable explanation of how the tier was chosen. */
	reason: string;
	overridden: boolean;
	webgl2: boolean;
	gpu: string | null;
	dpr: number;
	mobile: boolean;
	/** Median frame time (ms) under synthetic load; null if benchmark skipped. */
	medianFrameMs: number | null;
}

const STORAGE_KEY = 'garden:tier';

/** Median frame time above this (≈ under 30 fps under load) → reduced. */
const REDUCED_FRAME_MS = 33;

function isTier(v: string | null): v is Tier {
	return v === 'full' || v === 'reduced' || v === 'none';
}

function readOverride(): Tier | null {
	const param = new URLSearchParams(location.search).get('tier');
	if (param === 'auto') {
		localStorage.removeItem(STORAGE_KEY);
		return null;
	}
	if (isTier(param)) {
		localStorage.setItem(STORAGE_KEY, param);
		return param;
	}
	const stored = localStorage.getItem(STORAGE_KEY);
	return isTier(stored) ? stored : null;
}

function isMobile(): boolean {
	const coarse = matchMedia('(pointer: coarse)').matches;
	const uaMobile =
		(navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile ??
		/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
	return coarse && uaMobile;
}

function gpuName(gl: WebGL2RenderingContext): string | null {
	const ext = gl.getExtension('WEBGL_debug_renderer_info');
	return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : null;
}

/**
 * Renders ~10 frames of a synthetic fragment-heavy scene offscreen and
 * returns the median frame time in ms. Forces a GPU sync each frame via a
 * 1×1 readPixels so we measure render cost, not command submission.
 */
async function benchmark(gl: WebGL2RenderingContext): Promise<number> {
	const FRAMES = 10;
	const WARMUP = 3;
	const OVERDRAW = 6;

	const vsSrc = `#version 300 es
	void main() {
		// Fullscreen triangle from gl_VertexID, no buffers needed.
		vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
		gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
	}`;
	const fsSrc = `#version 300 es
	precision highp float;
	uniform float uSeed;
	out vec4 color;
	void main() {
		vec2 uv = gl_FragCoord.xy / 384.0;
		float v = uSeed;
		for (int i = 0; i < 120; i++) {
			v = sin(v * 1.37 + uv.x * float(i)) + cos(v * 0.91 - uv.y * float(i));
		}
		color = vec4(fract(v), uv, 1.0);
	}`;

	const compile = (type: number, src: string) => {
		const s = gl.createShader(type)!;
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed');
		}
		return s;
	};

	const prog = gl.createProgram()!;
	gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
	gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(prog) ?? 'program link failed');
	}
	gl.useProgram(prog);
	const uSeed = gl.getUniformLocation(prog, 'uSeed');
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	const px = new Uint8Array(4);
	const times: number[] = [];

	for (let frame = 0; frame < FRAMES; frame++) {
		await new Promise(requestAnimationFrame);
		const t0 = performance.now();
		for (let pass = 0; pass < OVERDRAW; pass++) {
			gl.uniform1f(uSeed, frame + pass * 0.618);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		}
		gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
		if (frame >= WARMUP) times.push(performance.now() - t0);
	}

	times.sort((a, b) => a - b);
	return times[Math.floor(times.length / 2)];
}

/** Run the full probe. Browser-only; call from onMount or equivalent. */
export async function probeCapability(): Promise<CapabilityReport> {
	const dpr = devicePixelRatio ?? 1;
	const mobile = isMobile();

	const base = { overridden: false, dpr, mobile, gpu: null, medianFrameMs: null };

	const override = readOverride();

	const canvas = document.createElement('canvas');
	canvas.width = 384;
	canvas.height = 384;
	const gl = canvas.getContext('webgl2', {
		powerPreference: 'high-performance',
		failIfMajorPerformanceCaveat: false
	});

	if (!gl) {
		// A 'full'/'reduced' override can't conjure a GL context; 'none' is moot.
		return { ...base, tier: 'none', reason: 'WebGL2 unavailable', webgl2: false };
	}

	const gpu = gpuName(gl);

	if (override) {
		return {
			...base,
			tier: override,
			reason: `manual override (?tier= / localStorage)`,
			overridden: true,
			webgl2: true,
			gpu
		};
	}

	let medianFrameMs: number | null = null;
	try {
		medianFrameMs = await benchmark(gl);
	} catch {
		// Benchmark failure on a working context → be conservative, not fatal.
		return {
			...base,
			tier: 'reduced',
			reason: 'benchmark failed on a working WebGL2 context',
			webgl2: true,
			gpu
		};
	} finally {
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	}

	const softwareGpu = gpu !== null && /swiftshader|llvmpipe|software/i.test(gpu);

	let tier: Tier;
	let reason: string;
	if (softwareGpu) {
		tier = 'reduced';
		reason = `software rasterizer (${gpu})`;
	} else if (medianFrameMs > REDUCED_FRAME_MS) {
		tier = 'reduced';
		reason = `slow benchmark (${medianFrameMs.toFixed(1)} ms/frame under load)`;
	} else if (mobile) {
		tier = 'reduced';
		reason = 'mobile device (coarse pointer + mobile UA)';
	} else {
		tier = 'full';
		reason = `fast benchmark (${medianFrameMs.toFixed(1)} ms/frame under load)`;
	}

	return { ...base, tier, reason, webgl2: true, gpu, medianFrameMs };
}
