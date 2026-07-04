import * as THREE from 'three';

/**
 * Shared garden geography. Everything that sits on the ground — grass
 * blades, hedges, trees, waypoints (M2) — samples `terrainHeight` so it
 * agrees with the terrain mesh.
 */

/** Radius of the hedge ring (the walled garden). */
export const GARDEN_RADIUS = 25.5;

/** Angle (radians, from +x toward +z) of the gate gap in the hedge. */
export const GATE_ANGLE = Math.atan2(12, 10);

/** The pond: a depression in the terrain filled by a water disc. */
export const POND = { x: 7.5, z: -5.5, r: 4.2, waterY: -0.22 };

/* ── Deterministic value noise (no deps, stable across sessions) ── */

function hash2(ix: number, iz: number): number {
	const s = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453123;
	return s - Math.floor(s);
}

function smooth(t: number): number {
	return t * t * (3 - 2 * t);
}

function valueNoise(x: number, z: number): number {
	const ix = Math.floor(x);
	const iz = Math.floor(z);
	const fx = smooth(x - ix);
	const fz = smooth(z - iz);
	const a = hash2(ix, iz);
	const b = hash2(ix + 1, iz);
	const c = hash2(ix, iz + 1);
	const d = hash2(ix + 1, iz + 1);
	return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz; // 0..1
}

function clamp01(t: number): number {
	return t < 0 ? 0 : t > 1 ? 1 : t;
}

function smoothstep(e0: number, e1: number, t: number): number {
	return smooth(clamp01((t - e0) / (e1 - e0)));
}

/** Rolling-meadow height. Flat-ish and walkable inside the hedge. */
export function terrainHeight(x: number, z: number): number {
	let h =
		0.45 * (valueNoise(x * 0.07, z * 0.07) - 0.5) * 2 +
		0.12 * (valueNoise(x * 0.23 + 50, z * 0.23 + 50) - 0.5) * 2;

	// Keep the garden interior gentle; let the world roll beyond the hedge.
	const r = Math.hypot(x, z);
	h *= 0.25 + 0.75 * smoothstep(GARDEN_RADIUS * 0.55, GARDEN_RADIUS * 1.3, r);

	// Pond depression (deeper than the water line so the bowl reads).
	const dp = Math.hypot(x - POND.x, z - POND.z);
	h -= 0.85 * (1 - smoothstep(POND.r * 0.35, POND.r + 2.2, dp));

	return h;
}

/** Noise in 0..1 used for meadow color variation (terrain + grass tint). */
export function meadowPatchiness(x: number, z: number): number {
	return valueNoise(x * 0.12 + 200, z * 0.12 + 200);
}

/** Deterministic LCG so grass/hedge layouts are stable between visits. */
export function makeRng(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

/** Direction toward the sun; sky shader and DirectionalLight stay in sync. */
export const SUN_DIR = new THREE.Vector3(6, 10, 4).normalize();

export const COLORS = {
	sky: {
		zenith: new THREE.Color('#6fbdf0'),
		horizon: new THREE.Color('#dff3fc')
	},
	fog: new THREE.Color('#d7eefa'),
	meadowA: new THREE.Color('#7ec850'),
	meadowB: new THREE.Color('#94d45e'),
	soil: new THREE.Color('#c9a86a'),
	pondDeep: new THREE.Color('#2f8fc2'),
	pondShallow: new THREE.Color('#7fd4e8'),
	grassRoot: new THREE.Color('#5aa83e'),
	grassTip: new THREE.Color('#b8e356'),
	hedge: new THREE.Color('#3c8a46')
};
