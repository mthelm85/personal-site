<script lang="ts">
	import * as THREE from 'three';
	import { T } from '@threlte/core';
	import { garden } from './state.svelte';
	import { terrainHeight, meadowPatchiness, COLORS, POND } from './terrain';

	const full = $derived(garden.tier === 'full');

	const SIZE = 90;
	const SEGMENTS = 120;

	const geometry = (() => {
		const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
		geo.rotateX(-Math.PI / 2);

		const pos = geo.attributes.position;
		const colors = new Float32Array(pos.count * 3);
		const c = new THREE.Color();

		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const z = pos.getZ(i);
			const y = terrainHeight(x, z);
			pos.setY(i, y);

			// Meadow color: two greens mixed by patch noise, sandy near the
			// pond rim, darker in the pond bowl.
			c.copy(COLORS.meadowA).lerp(COLORS.meadowB, meadowPatchiness(x, z));
			const dp = Math.hypot(x - POND.x, z - POND.z);
			if (dp < POND.r + 1.6) {
				const t = 1 - Math.min(1, Math.max(0, (dp - POND.r * 0.55) / (POND.r + 1.6 - POND.r * 0.55)));
				c.lerp(COLORS.soil, Math.min(1, t * 1.4));
			}
			colors[i * 3] = c.r;
			colors[i * 3 + 1] = c.g;
			colors[i * 3 + 2] = c.b;
		}

		geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		geo.computeVertexNormals();
		return geo;
	})();
</script>

<T.Mesh {geometry} receiveShadow={full}>
	<T.MeshStandardMaterial vertexColors flatShading roughness={1} />
</T.Mesh>
