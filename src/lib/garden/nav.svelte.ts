import * as THREE from 'three';
import gsap from 'gsap';
import { terrainHeight } from './terrain';
import { findPath, getWaypoint, eyePosition, EYE_HEIGHT } from './waypoints';

/** Walking pace in world units per second. */
const SPEED = 4.2;

/**
 * Navigation state + camera motion. The camera rig copies `camPos` /
 * `camLook` every frame; gsap tweens mutate them. Reactive fields tell the
 * UI which node we're at and whether we're mid-walk.
 */
class Nav {
	current = $state('gate');
	traveling = $state(false);
	/** Keyboard-focused waypoint (tab/arrows), null when mouse-driven. */
	focused = $state<string | null>(null);

	readonly camPos: THREE.Vector3;
	readonly camLook: THREE.Vector3;

	private timeline: gsap.core.Timeline | null = null;

	constructor() {
		const start = getWaypoint('gate');
		this.camPos = new THREE.Vector3(...eyePosition(start));
		this.camLook = new THREE.Vector3(...start.look);
	}

	walkTo(id: string) {
		if (this.traveling || id === this.current) return;

		const path = findPath(this.current, id);
		const dest = path[path.length - 1];
		this.traveling = true;
		this.focused = null;

		const tl = gsap.timeline({
			onComplete: () => {
				this.traveling = false;
				this.current = dest.id;
			}
		});

		let t = 0;
		for (let i = 1; i < path.length; i++) {
			const node = path[i];
			const eye = eyePosition(node);
			const from = i === 1 ? this.camPos : new THREE.Vector3(...eyePosition(path[i - 1]));
			const dist = from.distanceTo(new THREE.Vector3(...eye));
			const dur = Math.max(0.7, dist / SPEED);

			const first = i === 1;
			const last = i === path.length - 1;
			// Ease into the walk, glide through intermediate nodes, settle at the end.
			const ease = first && last ? 'power2.inOut' : first ? 'power2.in' : last ? 'power2.out' : 'none';

			tl.to(this.camPos, { x: eye[0], y: eye[1], z: eye[2], duration: dur, ease }, t);

			// While walking, look where you're going (eye-level at the next node);
			// the final gaze settles on the destination's point of interest.
			const lookAt: [number, number, number] = last
				? node.look
				: [node.x, terrainHeight(node.x, node.z) + EYE_HEIGHT * 0.75, node.z];
			tl.to(
				this.camLook,
				{
					x: lookAt[0],
					y: lookAt[1],
					z: lookAt[2],
					duration: last ? dur * 1.15 : dur,
					ease: 'power2.inOut'
				},
				t
			);

			t += dur;
		}

		this.timeline?.kill();
		this.timeline = tl;
	}
}

export const nav = new Nav();

// Dev-only handle for driving navigation from the console / test tooling.
if (import.meta.env.DEV && typeof window !== 'undefined') {
	(window as Window & { __nav?: Nav }).__nav = nav;
}
