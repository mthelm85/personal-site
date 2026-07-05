<script lang="ts">
	import { T } from '@threlte/core';
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
	import Shed from './Shed.svelte';
	import NoticeBoard from './NoticeBoard.svelte';
	import Placard from './Placard.svelte';
	import GWTree from './GWTree.svelte';

	interactivity();

	const full = $derived(garden.tier === 'full');

	// Reduced tier pulls the fog in: shorter draw distance, fewer pixels doing work.
	const fogNear = $derived(full ? 34 : 20);
	const fogFar = $derived(full ? 85 : 52);

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

<!-- The Galton–Watson tree: a live branching-process realization -->
<GWTree />

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

<Shed />
<NoticeBoard />

<!-- The sapling's botanical placard -->
<Placard
	x={1.1}
	z={1.3}
	yaw={Math.atan2(3.4 - 1.1, 3.0 - 1.3)}
	onactivate={() => {
		nav.walkTo('sapling');
		garden.panel = 'placard:sapling';
	}}
/>
