<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { garden } from './state.svelte';
	import { terrainHeight, COLORS, SUN_DIR } from './terrain';
	import { nav } from './nav.svelte';
	import Terrain from './Terrain.svelte';
	import Sky from './Sky.svelte';
	import Pond from './Pond.svelte';
	import Hedge from './Hedge.svelte';
	import CameraRig from './CameraRig.svelte';
	import Waypoints from './Waypoints.svelte';

	interactivity();

	const full = $derived(garden.tier === 'full');

	// Reduced tier pulls the fog in: shorter draw distance, fewer pixels doing work.
	const fogNear = $derived(full ? 34 : 20);
	const fogFar = $derived(full ? 85 : 52);

	// Clicking a specimen walks to its waypoint.
	const walkCursor = {
		onpointerenter: () => (document.body.style.cursor = 'pointer'),
		onpointerleave: () => (document.body.style.cursor = 'default')
	};

	// Gentle sway on the sapling proves the render loop is alive.
	let sway = $state(0);
	let t = 0;
	useTask((delta) => {
		t += delta;
		sway = Math.sin(t * 1.2) * 0.06;
	});

	// Trees: a few accents inside the hedge, bigger ones outside for depth.
	const trees = [
		{ x: -8, z: -9, s: 1.5, c: '#2f7d3b' },
		{ x: 10, z: 6, s: 1.2, c: '#4fae5c' },
		{ x: -13, z: 6, s: 1.7, c: '#3e9b4f' },
		{ x: -26, z: -18, s: 2.8, c: '#2f7d3b' },
		{ x: 4, z: -30, s: 3.2, c: '#35864a' },
		{ x: -32, z: 8, s: 2.6, c: '#3e9b4f' },
		{ x: 26, z: -22, s: 3.0, c: '#2f7d3b' },
		{ x: 32, z: 10, s: 2.4, c: '#35864a' }
	].map((tr) => ({ ...tr, y: terrainHeight(tr.x, tr.z) }));

	const shedY = terrainHeight(-5, 2);
	const sapY = terrainHeight(0, 0);
</script>

<T.Color attach="background" args={[COLORS.sky.horizon.getHex()]} />
<T.Fog attach="fog" args={[COLORS.fog.getHex(), fogNear, fogFar]} />

<CameraRig />
<Waypoints />

<Sky />

<T.AmbientLight color="#dff3ff" intensity={0.85} />
<T.DirectionalLight
	position={[SUN_DIR.x * 30, SUN_DIR.y * 30, SUN_DIR.z * 30]}
	color="#fff6e0"
	intensity={2.1}
	castShadow={full}
	shadow.mapSize.width={2048}
	shadow.mapSize.height={2048}
	shadow.camera.left={-24}
	shadow.camera.right={24}
	shadow.camera.top={24}
	shadow.camera.bottom={-24}
	shadow.camera.far={80}
	shadow.bias={-0.0005}
/>

<Terrain />
<Pond />
<Hedge />

<!-- Sapling: trunk + swaying crown (the Galton–Watson tree arrives in M4) -->
<T.Group position={[0, sapY, 0]}>
	<T.Mesh position.y={0.6} castShadow={full} onclick={() => nav.walkTo('sapling')} {...walkCursor}>
		<T.CylinderGeometry args={[0.12, 0.18, 1.2, 7]} />
		<T.MeshStandardMaterial color="#8a5a3b" flatShading />
	</T.Mesh>
	<T.Group position.y={1.2} rotation.z={sway}>
		<T.Mesh position.y={0.9} castShadow={full} onclick={() => nav.walkTo('sapling')} {...walkCursor}>
			<T.ConeGeometry args={[1.0, 1.8, 8]} />
			<T.MeshStandardMaterial color="#3e9b4f" flatShading />
		</T.Mesh>
	</T.Group>
</T.Group>

{#each trees as tree (tree)}
	<T.Group position={[tree.x, tree.y, tree.z]} scale={tree.s}>
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
<T.Group position={[-5, shedY, 2]} rotation.y={0.5}>
	<T.Mesh position.y={0.75} castShadow={full} onclick={() => nav.walkTo('shed')} {...walkCursor}>
		<T.BoxGeometry args={[2.2, 1.5, 1.8]} />
		<T.MeshStandardMaterial color="#e8b04b" flatShading />
	</T.Mesh>
	<T.Mesh
		position.y={1.85}
		rotation.y={Math.PI / 4}
		castShadow={full}
		onclick={() => nav.walkTo('shed')}
		{...walkCursor}
	>
		<T.ConeGeometry args={[1.7, 0.9, 4]} />
		<T.MeshStandardMaterial color="#c95b3f" flatShading />
	</T.Mesh>
</T.Group>
