<script lang="ts">
	import * as THREE from 'three';
	import { T } from '@threlte/core';
	import { garden } from './state.svelte';
	import { terrainHeight, makeRng, GARDEN_RADIUS, GATE_ANGLE } from './terrain';

	const full = $derived(garden.tier === 'full');

	/** Half-width of the gate opening, in radians along the ring. */
	const GATE_HALF = 0.16;

	const BUSH_GREENS = ['#3c8a46', '#347a3e', '#4b9a52'];

	/**
	 * The boundary is a ring of bushes: clusters of squashed, jittered
	 * icospheres. Round silhouettes + mixed greens keep it reading as
	 * foliage rather than green masonry.
	 */
	const mesh = (() => {
		const rng = makeRng(31415926);
		const slots = 56;

		const puffs: { pos: THREE.Vector3; scale: THREE.Vector3; rot: number; color: THREE.Color }[] =
			[];

		for (let i = 0; i < slots; i++) {
			const angle = (i / slots) * Math.PI * 2;
			let da = Math.abs(angle - GATE_ANGLE);
			da = Math.min(da, Math.PI * 2 - da);
			if (da < GATE_HALF) continue; // the gate gap

			// 2-3 puffs per slot, scattered along the ring tangent.
			const count = 2 + Math.floor(rng() * 2);
			for (let p = 0; p < count; p++) {
				const a = angle + (rng() - 0.5) * (Math.PI * 2 / slots) * 1.15;
				const r = GARDEN_RADIUS + (rng() - 0.5) * 1.1;
				const x = Math.cos(a) * r;
				const z = Math.sin(a) * r;
				const s = 0.95 + rng() * 0.8;

				puffs.push({
					pos: new THREE.Vector3(x, terrainHeight(x, z) + s * 0.55, z),
					scale: new THREE.Vector3(s * (1 + rng() * 0.3), s * (0.75 + rng() * 0.25), s),
					rot: rng() * Math.PI,
					color: new THREE.Color(BUSH_GREENS[Math.floor(rng() * BUSH_GREENS.length)])
				});
			}
		}

		const geo = new THREE.IcosahedronGeometry(1, 1);
		const mat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 });
		const instanced = new THREE.InstancedMesh(geo, mat, puffs.length);

		const dummy = new THREE.Object3D();
		puffs.forEach((puff, i) => {
			dummy.position.copy(puff.pos);
			dummy.scale.copy(puff.scale);
			dummy.rotation.set(0, puff.rot, 0);
			dummy.updateMatrix();
			instanced.setMatrixAt(i, dummy.matrix);
			instanced.setColorAt(i, puff.color);
		});
		instanced.instanceMatrix.needsUpdate = true;
		if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
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
