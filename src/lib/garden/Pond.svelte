<script lang="ts">
	import * as THREE from 'three';
	import { T, useTask } from '@threlte/core';
	import { COLORS, POND } from './terrain';

	const material = new THREE.ShaderMaterial({
		uniforms: {
			uTime: { value: 0 },
			uDeep: { value: COLORS.pondDeep },
			uShallow: { value: COLORS.pondShallow }
		},
		vertexShader: /* glsl */ `
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform float uTime;
			uniform vec3 uDeep;
			uniform vec3 uShallow;
			varying vec2 vUv;

			void main() {
				vec2 p = vUv * 2.0 - 1.0;      // -1..1 across the disc
				float d = length(p);           // 0 center → 1 rim

				// Deep center → shallow rim.
				vec3 col = mix(uDeep, uShallow, smoothstep(0.25, 0.98, d));

				// Drifting cartoon ripple highlights: two crossing waves,
				// thresholded into soft bands.
				float w1 = sin(p.x * 9.0 + uTime * 1.1 + sin(p.y * 7.0 + uTime * 0.7) * 1.8);
				float w2 = sin(p.y * 8.0 - uTime * 0.9 + sin(p.x * 6.0 - uTime * 0.6) * 1.6);
				float bands = smoothstep(0.72, 0.98, w1 * w2 + 0.25 * sin(uTime * 0.5));
				col += vec3(0.9, 0.98, 1.0) * bands * 0.22;

				// Foam ring hugging the shore, gently breathing.
				float wobble = 0.02 * sin(atan(p.y, p.x) * 7.0 + uTime * 0.8);
				float foam = smoothstep(0.9 + wobble, 0.985 + wobble, d);
				col = mix(col, vec3(0.94, 0.99, 1.0), foam * 0.85);

				gl_FragColor = vec4(col, 1.0);
			}
		`
	});

	useTask((delta) => {
		material.uniforms.uTime.value += delta;
	});
</script>

<T.Mesh
	{material}
	position={[POND.x, POND.waterY, POND.z]}
	rotation.x={-Math.PI / 2}
>
	<T.CircleGeometry args={[POND.r, 48]} />
</T.Mesh>
