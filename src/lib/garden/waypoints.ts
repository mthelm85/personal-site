import { terrainHeight } from './terrain';

/**
 * Hand-placed waypoint graph on the garden path. Clicking any waypoint
 * walks the camera through the graph (BFS by hop count), so travel always
 * follows the path — geography, not teleporting.
 */

export interface Waypoint {
	id: string;
	/** Where the visitor stands (x, z — y comes from the terrain). */
	x: number;
	z: number;
	/** What you face after arriving: [x, y, z] in world space. */
	look: [number, number, number];
	label: string;
}

/** Eye height above the terrain — cartoonish, slightly kid-in-a-garden. */
export const EYE_HEIGHT = 1.85;

export const WAYPOINTS: Waypoint[] = [
	{ id: 'gate', x: 13.8, z: 16.4, look: [0, 1.2, 0], label: 'Garden gate' },
	{ id: 'path', x: 8.2, z: 9.2, look: [0, 1.3, 0], label: 'Garden path' },
	{ id: 'sapling', x: 3.4, z: 3.0, look: [0, 1.4, 0], label: 'The sapling' },
	{ id: 'pond', x: 10.2, z: 0.2, look: [7.5, -0.1, -5.5], label: 'Pond shore' },
	{ id: 'shed', x: -0.6, z: 4.4, look: [-5, 1.2, 2], label: 'Potting shed' },
	{ id: 'meadow', x: -6.5, z: -4.0, look: [-8, 2.4, -9], label: 'West meadow' }
];

export const EDGES: [string, string][] = [
	['gate', 'path'],
	['path', 'sapling'],
	['path', 'pond'],
	['sapling', 'pond'],
	['sapling', 'shed'],
	['shed', 'meadow'],
	['pond', 'meadow']
];

const byId = new Map(WAYPOINTS.map((w) => [w.id, w]));
const neighbors = new Map<string, string[]>();
for (const [a, b] of EDGES) {
	neighbors.set(a, [...(neighbors.get(a) ?? []), b]);
	neighbors.set(b, [...(neighbors.get(b) ?? []), a]);
}

export function getWaypoint(id: string): Waypoint {
	const w = byId.get(id);
	if (!w) throw new Error(`unknown waypoint: ${id}`);
	return w;
}

export function neighborsOf(id: string): string[] {
	return neighbors.get(id) ?? [];
}

/** Standing eye position at a waypoint. */
export function eyePosition(w: Waypoint): [number, number, number] {
	return [w.x, terrainHeight(w.x, w.z) + EYE_HEIGHT, w.z];
}

/** Shortest hop path between waypoints, endpoints included. */
export function findPath(from: string, to: string): Waypoint[] {
	if (from === to) return [getWaypoint(from)];
	const prev = new Map<string, string>();
	const queue = [from];
	const seen = new Set([from]);
	while (queue.length > 0) {
		const cur = queue.shift()!;
		for (const next of neighborsOf(cur)) {
			if (seen.has(next)) continue;
			seen.add(next);
			prev.set(next, cur);
			if (next === to) {
				const path = [to];
				let p = to;
				while (p !== from) {
					p = prev.get(p)!;
					path.unshift(p);
				}
				return path.map((id) => getWaypoint(id));
			}
			queue.push(next);
		}
	}
	// Disconnected graphs are a content bug; walk directly rather than crash.
	return [getWaypoint(from), getWaypoint(to)];
}
