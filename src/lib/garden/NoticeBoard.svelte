<script lang="ts">
	import { T } from '@threlte/core';
	import { garden } from './state.svelte';
	import { terrainHeight } from './terrain';
	import { nav } from './nav.svelte';

	const X = 12.4;
	const Z = 11.4;
	const Y = terrainHeight(X, Z);
	// Face the 'board' waypoint so the text side greets the reader.
	const YAW = Math.atan2(10.6 - X, 12.6 - Z);

	const cursor = {
		onpointerenter: () => (document.body.style.cursor = 'pointer'),
		onpointerleave: () => (document.body.style.cursor = 'default')
	};

	function read() {
		nav.walkTo('board');
		garden.panel = 'about';
	}
</script>

<T.Group position={[X, Y, Z]} rotation.y={YAW}>
	<!-- Posts -->
	{#each [-0.8, 0.8] as px (px)}
		<T.Mesh position={[px, 0.8, 0]} castShadow={garden.tier === 'full'}>
			<T.CylinderGeometry args={[0.08, 0.1, 1.6, 6]} />
			<T.MeshStandardMaterial color="#8a5a3b" flatShading />
		</T.Mesh>
	{/each}

	<!-- Board frame + face -->
	<T.Group position={[0, 1.35, 0]} rotation.x={-0.08}>
		<T.Mesh castShadow={garden.tier === 'full'} onclick={read} {...cursor}>
			<T.BoxGeometry args={[1.9, 1.15, 0.09]} />
			<T.MeshStandardMaterial color="#8a5a3b" flatShading />
		</T.Mesh>
		<T.Mesh position.z={0.06} onclick={read} {...cursor}>
			<T.BoxGeometry args={[1.7, 0.95, 0.02]} />
			<T.MeshStandardMaterial color="#f3ead6" flatShading />
		</T.Mesh>
		<!-- "Text" lines carved into the face -->
		{#each [0.28, 0.12, -0.04, -0.2] as ly, i (ly)}
			<T.Mesh position={[i % 2 === 0 ? -0.1 : 0.05, ly, 0.08]}>
				<T.BoxGeometry args={[i === 0 ? 0.7 : 1.2 - (i % 2) * 0.25, 0.045, 0.01]} />
				<T.MeshStandardMaterial color="#b8a988" flatShading />
			</T.Mesh>
		{/each}
	</T.Group>

	<!-- Little roof over the board -->
	<T.Mesh position={[0, 2.06, 0.02]} rotation.x={0.15} castShadow={garden.tier === 'full'}>
		<T.BoxGeometry args={[2.1, 0.07, 0.5]} />
		<T.MeshStandardMaterial color="#c95b3f" flatShading />
	</T.Mesh>
</T.Group>
