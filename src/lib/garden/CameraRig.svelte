<script lang="ts">
	import type { PerspectiveCamera } from 'three';
	import { T, useTask } from '@threlte/core';
	import { nav } from './nav.svelte';

	let camera: PerspectiveCamera | undefined = $state();

	// Subtle head-bob while walking so travel reads as footsteps, not a dolly.
	let t = 0;
	useTask((delta) => {
		if (!camera) return;
		t += delta;
		const bob = nav.traveling ? Math.sin(t * 9) * 0.045 : 0;
		camera.position.set(nav.camPos.x, nav.camPos.y + bob, nav.camPos.z);
		camera.lookAt(nav.camLook);
	});
</script>

<T.PerspectiveCamera makeDefault fov={50} bind:ref={camera} />
