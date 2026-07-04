<script lang="ts">
	import * as THREE from 'three';
	import { T, useTask } from '@threlte/core';
	import { makeRng, COLORS, SUN_DIR } from './terrain';

	const skyMaterial = new THREE.ShaderMaterial({
		side: THREE.BackSide,
		depthWrite: false,
		uniforms: {
			uZenith: { value: COLORS.sky.zenith },
			uHorizon: { value: COLORS.sky.horizon },
			uSunDir: { value: SUN_DIR }
		},
		vertexShader: /* glsl */ `
			varying vec3 vDir;
			void main() {
				vDir = normalize(position);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform vec3 uZenith;
			uniform vec3 uHorizon;
			uniform vec3 uSunDir;
			varying vec3 vDir;

			void main() {
				vec3 dir = normalize(vDir);
				float h = clamp(dir.y, 0.0, 1.0);
				vec3 col = mix(uHorizon, uZenith, pow(h, 0.55));

				// Sun: soft disc + wide warm glow.
				float sd = clamp(dot(dir, uSunDir), 0.0, 1.0);
				col += vec3(1.0, 0.92, 0.6) * smoothstep(0.9993, 0.9998, sd);
				col += vec3(1.0, 0.85, 0.5) * pow(sd, 180.0) * 0.35;

				gl_FragColor = vec4(col, 1.0);
			}
		`
	});

	/* Puffy clouds: clusters of squashed icospheres, slowly circling. */
	const cloudMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
	const puffGeo = new THREE.IcosahedronGeometry(1, 0);

	const clouds = (() => {
		const rng = makeRng(11235813);
		return Array.from({ length: 7 }, () => {
			const angle = rng() * Math.PI * 2;
			const radius = 55 + rng() * 60;
			const y = 26 + rng() * 16;
			const puffs = Array.from({ length: 3 + Math.floor(rng() * 3) }, (_, i) => ({
				x: (i - 1.2) * (1.6 + rng()),
				y: (rng() - 0.5) * 0.8,
				z: (rng() - 0.5) * 1.6,
				s: 1.6 + rng() * 1.8
			}));
			return { angle, radius, y, puffs, spin: 0.004 + rng() * 0.004 };
		});
	})();

	let drift = $state(0);
	useTask((delta) => {
		drift += delta;
	});
</script>

<T.Mesh material={skyMaterial} renderOrder={-10}>
	<T.SphereGeometry args={[170, 32, 16]} />
</T.Mesh>

{#each clouds as cloud (cloud)}
	{@const a = cloud.angle + drift * cloud.spin}
	<T.Group
		position={[Math.cos(a) * cloud.radius, cloud.y, Math.sin(a) * cloud.radius]}
		scale={[1.8, 0.9, 1.2]}
	>
		{#each cloud.puffs as puff (puff)}
			<T.Mesh
				geometry={puffGeo}
				material={cloudMaterial}
				position={[puff.x, puff.y, puff.z]}
				scale={puff.s}
			/>
		{/each}
	</T.Group>
{/each}
