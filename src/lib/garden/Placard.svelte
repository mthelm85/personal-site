<script lang="ts">
	import { T } from '@threlte/core';
	import { terrainHeight } from './terrain';

	let {
		x,
		z,
		yaw,
		onactivate
	}: { x: number; z: number; yaw: number; onactivate: () => void } = $props();

	const y = $derived(terrainHeight(x, z));

	let hovered = $state(false);

	const handlers = {
		onclick: (e: { stopPropagation: () => void }) => {
			e.stopPropagation();
			onactivate();
		},
		onpointerenter: () => {
			hovered = true;
			document.body.style.cursor = 'pointer';
		},
		onpointerleave: () => {
			hovered = false;
			document.body.style.cursor = 'default';
		}
	};
</script>

<!-- Botanical-garden placard: post + tilted plaque. The rigor layer. -->
<T.Group position={[x, y, z]} rotation.y={yaw} scale={hovered ? 1.12 : 1}>
	<T.Mesh position.y={0.28}>
		<T.CylinderGeometry args={[0.045, 0.055, 0.56, 6]} />
		<T.MeshStandardMaterial color="#8a5a3b" flatShading />
	</T.Mesh>
	<T.Group position.y={0.58} rotation.x={-0.5}>
		<T.Mesh {...handlers}>
			<T.BoxGeometry args={[0.62, 0.38, 0.05]} />
			<T.MeshStandardMaterial color="#8a5a3b" flatShading />
		</T.Mesh>
		<T.Mesh position.z={0.032} {...handlers}>
			<T.BoxGeometry args={[0.54, 0.3, 0.015]} />
			<T.MeshStandardMaterial color={hovered ? '#fffdf5' : '#f3ead6'} flatShading />
		</T.Mesh>
	</T.Group>
</T.Group>
