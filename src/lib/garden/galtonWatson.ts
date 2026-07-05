import * as THREE from 'three';

/**
 * A Galton–Watson branching process, rendered honestly: every branch of
 * the tree is one individual, and each individual bears a random number
 * of offspring drawn i.i.d. from OFFSPRING. The whole crown is a single
 * realization of the process — the placard shows this realization's
 * numbers, and clicking the tree draws a fresh one.
 */

/** P(k offspring) for k = 0, 1, 2, 3. Mean ≈ 1.65 (supercritical). */
export const OFFSPRING = [0.15, 0.25, 0.4, 0.2];

export const OFFSPRING_MEAN = OFFSPRING.reduce((m, p, k) => m + p * k, 0);

/** Safety caps so a lucky lineage can't melt the GPU. */
const MAX_GENERATIONS = 6;
const MAX_PER_GENERATION = 90;

export interface Branch {
	start: THREE.Vector3;
	dir: THREE.Vector3; // unit direction
	length: number;
	radius: number;
	generation: number;
	/** True if this individual had zero offspring (a leaf-bearing tip). */
	terminal: boolean;
}

export interface Realization {
	branches: Branch[];
	/** Individuals per generation, starting at generation 0 (the trunk). */
	populations: number[];
	total: number;
	generations: number;
	/** The lineage died before hitting the generation cap. */
	extinct: boolean;
	/** Population was clipped by the rendering caps (rare, honest to admit). */
	truncated: boolean;
}

function sampleOffspring(): number {
	const u = Math.random();
	let acc = 0;
	for (let k = 0; k < OFFSPRING.length; k++) {
		acc += OFFSPRING[k];
		if (u < acc) return k;
	}
	return OFFSPRING.length - 1;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Child directions: tilt away from the parent by 25–50°, azimuths spread
 * around the parent with jitter, and a gentle upward bias so the crown
 * lifts instead of drooping.
 */
function childDirection(parent: THREE.Vector3, index: number, count: number): THREE.Vector3 {
	const tilt = 0.45 + Math.random() * 0.45; // 26°–52°
	const azimuth = (index / count) * Math.PI * 2 + Math.random() * 1.2;

	// Orthonormal frame around the parent direction.
	const ortho = Math.abs(parent.y) < 0.95 ? UP : new THREE.Vector3(1, 0, 0);
	const u = new THREE.Vector3().crossVectors(parent, ortho).normalize();
	const v = new THREE.Vector3().crossVectors(parent, u).normalize();

	return new THREE.Vector3()
		.copy(parent)
		.multiplyScalar(Math.cos(tilt))
		.addScaledVector(u, Math.sin(tilt) * Math.cos(azimuth))
		.addScaledVector(v, Math.sin(tilt) * Math.sin(azimuth))
		.addScaledVector(UP, 0.25) // heliotropism, cartoon edition
		.normalize();
}

export function sampleRealization(): Realization {
	const trunk: Branch = {
		start: new THREE.Vector3(0, 0, 0),
		dir: UP.clone(),
		length: 1.35,
		radius: 0.16,
		generation: 0,
		terminal: false
	};

	const branches: Branch[] = [trunk];
	const populations = [1];
	let truncated = false;

	let current = [trunk];
	for (let gen = 1; gen <= MAX_GENERATIONS; gen++) {
		const next: Branch[] = [];

		for (const parent of current) {
			const kids = sampleOffspring();
			if (kids === 0) {
				parent.terminal = true;
				continue;
			}
			for (let i = 0; i < kids; i++) {
				if (next.length >= MAX_PER_GENERATION) {
					truncated = true;
					break;
				}
				const dir = childDirection(parent.dir, i, kids);
				next.push({
					start: parent.start.clone().addScaledVector(parent.dir, parent.length),
					dir,
					length: parent.length * (0.68 + Math.random() * 0.12),
					radius: parent.radius * 0.62,
					generation: gen,
					terminal: false
				});
			}
		}

		if (next.length === 0) break;
		populations.push(next.length);
		branches.push(...next);
		current = next;
	}

	// Individuals alive at the cap are tips too — give them leaves.
	for (const b of current) {
		if (b.generation === MAX_GENERATIONS) b.terminal = true;
	}

	return {
		branches,
		populations,
		total: branches.length,
		generations: populations.length - 1,
		extinct: populations.length - 1 < MAX_GENERATIONS,
		truncated
	};
}
