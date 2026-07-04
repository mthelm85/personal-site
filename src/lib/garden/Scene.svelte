<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { garden } from './state.svelte';

	const full = $derived(garden.tier === 'full');

	// Gentle sway on the sapling proves the render loop is alive.
	let sway = $state(0);
	let t = 0;
	useTask((delta) => {
		t += delta;
		sway = Math.sin(t * 1.2) * 0.06;
	});
</script>

<T.Color attach="background" args={['#aee1f9']} />
<T.Fog attach="fog" args={['#aee1f9', 25, 60]} />

<T.PerspectiveCamera
	makeDefault
	position={[7, 4.5, 9]}
	fov={42}
	oncreate={(cam) => cam.lookAt(0, 0.8, 0)}
/>

<T.AmbientLight color="#dff3ff" intensity={0.9} />
<T.DirectionalLight
	position={[6, 10, 4]}
	color="#fff6e0"
	intensity={2.2}
	castShadow={full}
	shadow.mapSize.width={1024}
	shadow.mapSize.height={1024}
	shadow.camera.left={-12}
	shadow.camera.right={12}
	shadow.camera.top={12}
	shadow.camera.bottom={-12}
/>

<!-- Meadow -->
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow={full}>
	<T.CircleGeometry args={[30, 48]} />
	<T.MeshStandardMaterial color="#7ec850" flatShading />
</T.Mesh>

<!-- Sapling: trunk + swaying crown (stand-in for the Galton–Watson tree, M4) -->
<T.Group position={[0, 0, 0]}>
	<T.Mesh position.y={0.6} castShadow={full}>
		<T.CylinderGeometry args={[0.12, 0.18, 1.2, 7]} />
		<T.MeshStandardMaterial color="#8a5a3b" flatShading />
	</T.Mesh>
	<T.Group position.y={1.2} rotation.z={sway}>
		<T.Mesh position.y={0.9} castShadow={full}>
			<T.ConeGeometry args={[1.0, 1.8, 8]} />
			<T.MeshStandardMaterial color="#3e9b4f" flatShading />
		</T.Mesh>
	</T.Group>
</T.Group>

<!-- Background pines -->
{#each [
	{ x: -4.5, z: -3, s: 1.4, c: '#2f7d3b' },
	{ x: 3.8, z: -4.2, s: 1.8, c: '#3e9b4f' },
	{ x: -2.5, z: -6, s: 2.2, c: '#2f7d3b' },
	{ x: 6.2, z: -1.5, s: 1.1, c: '#4fae5c' }
] as tree (tree)}
	<T.Group position={[tree.x, 0, tree.z]} scale={tree.s}>
		<T.Mesh position.y={0.4} castShadow={full}>
			<T.CylinderGeometry args={[0.1, 0.14, 0.8, 6]} />
			<T.MeshStandardMaterial color="#8a5a3b" flatShading />
		</T.Mesh>
		<T.Mesh position.y={1.5} castShadow={full}>
			<T.ConeGeometry args={[0.8, 1.9, 7]} />
			<T.MeshStandardMaterial color={tree.c} flatShading />
		</T.Mesh>
	</T.Group>
{/each}

<!-- Potting-shed placeholder (modeled properly in M3) -->
<T.Group position={[-5, 0, 2]} rotation.y={0.5}>
	<T.Mesh position.y={0.75} castShadow={full}>
		<T.BoxGeometry args={[2.2, 1.5, 1.8]} />
		<T.MeshStandardMaterial color="#e8b04b" flatShading />
	</T.Mesh>
	<T.Mesh position.y={1.85} rotation.y={Math.PI / 4} castShadow={full}>
		<T.ConeGeometry args={[1.7, 0.9, 4]} />
		<T.MeshStandardMaterial color="#c95b3f" flatShading />
	</T.Mesh>
</T.Group>
