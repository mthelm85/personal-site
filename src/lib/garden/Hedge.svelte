<script lang="ts">
	import * as THREE from 'three';
	import { T } from '@threlte/core';
	import { garden } from './state.svelte';
	import { terrainHeight, makeRng, COLORS, GARDEN_RADIUS, GATE_ANGLE } from './terrain';

	const full = $derived(garden.tier === 'full');

	/** Half-width of the gate opening, in radians along the ring. */
	const GATE_HALF = 0.16;

	const mesh = (() => {
		const rng = makeRng(31415926);
		const segments = 68;

		const placements: THREE.Matrix4[] = [];
		const dummy = new THREE.Object3D();

		for (let i = 0; i < segments; i++) {
			const angle = (i / segments) * Math.PI * 2;
			let da = Math.abs(angle - GATE_ANGLE);
			da = Math.min(da, Math.PI * 2 - da);
			if (da < GATE_HALF) continue; // the gate gap

			const r = GARDEN_RADIUS + (rng() - 0.5) * 0.5;
			const x = Math.cos(angle) * r;
			const z = Math.sin(angle) * r;

			dummy.position.set(x, terrainHeight(x, z) + 0.7, z);
			dummy.rotation.set(0, -angle + (rng() - 0.5) * 0.2, 0);
			dummy.scale.set(
				1,
				0.85 + rng() * 0.35,
				0.9 + rng() * 0.3
			);
			dummy.updateMatrix();
			placements.push(dummy.matrix.clone());
		}

		const geo = new THREE.BoxGeometry(1.5, 1.7, 2.6);
		const mat = new THREE.MeshStandardMaterial({
			color: COLORS.hedge,
			flatShading: true,
			roughness: 1
		});
		const instanced = new THREE.InstancedMesh(geo, mat, placements.length);
		placements.forEach((m, i) => instanced.setMatrixAt(i, m));
		instanced.instanceMatrix.needsUpdate = true;
		return instanced;
	})();
</script>

<T is={mesh} castShadow={full} receiveShadow={full} />

<!-- Gate posts flanking the opening -->
{#each [-1, 1] as side (side)}
	{@const a = GATE_ANGLE + side * (GATE_HALF + 0.02)}
	{@const x = Math.cos(a) * GARDEN_RADIUS}
	{@const z = Math.sin(a) * GARDEN_RADIUS}
	<T.Mesh position={[x, terrainHeight(x, z) + 1.1, z]} castShadow={full}>
		<T.CylinderGeometry args={[0.16, 0.2, 2.2, 6]} />
		<T.MeshStandardMaterial color="#8a5a3b" flatShading />
	</T.Mesh>
{/each}
