<script lang="ts">
	import * as THREE from 'three';
	import { T, useTask } from '@threlte/core';
	import { garden } from './state.svelte';
	import {
		terrainHeight,
		meadowPatchiness,
		makeRng,
		COLORS,
		POND,
		GARDEN_RADIUS
	} from './terrain';
	import { WAYPOINTS } from './waypoints';

	let { fogNear = 24, fogFar = 60 }: { fogNear?: number; fogFar?: number } = $props();

	// Full: dense meadow. Reduced: sparse but still clearly grass.
	const COUNT = garden.tier === 'full' ? 48000 : 12000;
	const FIELD_RADIUS = GARDEN_RADIUS - 1.2;

	/* One blade: a tapered quad + tip (5 verts, 3 tris), 1 unit tall. */
	const bladePositions = new Float32Array([
		-0.045, 0, 0, 0.045, 0, 0, -0.028, 0.55, 0, 0.028, 0.55, 0, 0, 1, 0
	]);
	const bladeIndex = [0, 1, 2, 2, 1, 3, 2, 3, 4];

	const { geometry, material } = (() => {
		const rng = makeRng(20260704);
		const offsets = new Float32Array(COUNT * 3);
		const data = new Float32Array(COUNT * 3); // scaleX mult, height, angle

		let placed = 0;
		while (placed < COUNT) {
			const r = Math.sqrt(rng()) * FIELD_RADIUS;
			const theta = rng() * Math.PI * 2;
			const x = Math.cos(theta) * r;
			const z = Math.sin(theta) * r;

			// Keep blades out of the pond bowl and the shed footprint.
			if (Math.hypot(x - POND.x, z - POND.z) < POND.r + 1.0) continue;
			if (x > -6.6 && x < -3.4 && z > 0.7 && z < 3.3) continue;
			// Clearings around waypoints so the markers stay visible.
			if (WAYPOINTS.some((w) => Math.hypot(x - w.x, z - w.z) < 1.0)) continue;

			offsets[placed * 3] = x;
			offsets[placed * 3 + 1] = terrainHeight(x, z) - 0.02;
			offsets[placed * 3 + 2] = z;
			data[placed * 3] = 0.75 + rng() * 0.6;
			data[placed * 3 + 1] = (0.28 + rng() * 0.3) * (0.8 + 0.4 * meadowPatchiness(x, z));
			data[placed * 3 + 2] = rng() * Math.PI * 2;
			placed++;
		}

		const geo = new THREE.InstancedBufferGeometry();
		geo.instanceCount = COUNT;
		geo.setIndex(bladeIndex);
		geo.setAttribute('position', new THREE.BufferAttribute(bladePositions, 3));
		geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
		geo.setAttribute('aData', new THREE.InstancedBufferAttribute(data, 3));
		geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), GARDEN_RADIUS + 5);

		const mat = new THREE.ShaderMaterial({
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uRoot: { value: COLORS.grassRoot },
				uTip: { value: COLORS.grassTip },
				uFogColor: { value: COLORS.fog },
				uFogNear: { value: 24 },
				uFogFar: { value: 60 }
			},
			vertexShader: /* glsl */ `
				attribute vec3 aOffset;
				attribute vec3 aData; // x: width mult, y: height, z: yaw
				uniform float uTime;
				uniform float uFogNear;
				uniform float uFogFar;
				varying float vH;
				varying float vFog;
				varying float vShade;

				void main() {
					float widthMult = aData.x;
					float height = aData.y;
					float yaw = aData.z;

					vec3 p = position;
					p.x *= widthMult;
					float c = cos(yaw), s = sin(yaw);
					p = vec3(c * p.x, p.y, s * p.x);
					p.y *= height;

					// Wind: two sine gusts traveling across the meadow; blades
					// bend from the root (quadratic in normalized height).
					float bend = position.y * position.y;
					float gust =
						sin(uTime * 1.5 + aOffset.x * 0.32 + aOffset.z * 0.47) +
						0.55 * sin(uTime * 2.9 - aOffset.z * 0.6 + aOffset.x * 0.2);
					vec3 world = p + aOffset;
					world.x += bend * gust * 0.11 * height;
					world.z += bend * gust * 0.07 * height;

					vH = position.y;
					// Cheap shading: blades angled away from the sun read darker.
					vShade = 0.82 + 0.18 * sin(yaw + 1.1);

					vec4 mv = modelViewMatrix * vec4(world, 1.0);
					vFog = smoothstep(uFogNear, uFogFar, -mv.z);
					gl_Position = projectionMatrix * mv;
				}
			`,
			fragmentShader: /* glsl */ `
				uniform vec3 uRoot;
				uniform vec3 uTip;
				uniform vec3 uFogColor;
				varying float vH;
				varying float vFog;
				varying float vShade;

				void main() {
					vec3 col = mix(uRoot, uTip, vH) * vShade;
					col = mix(col, uFogColor, vFog);
					gl_FragColor = vec4(col, 1.0);
				}
			`
		});

		return { geometry: geo, material: mat };
	})();

	useTask((delta) => {
		material.uniforms.uTime.value += delta;
	});

	$effect(() => {
		material.uniforms.uFogNear.value = fogNear;
		material.uniforms.uFogFar.value = fogFar;
	});
</script>

<T.Mesh {geometry} {material} frustumCulled={false} />
