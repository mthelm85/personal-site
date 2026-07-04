<script lang="ts">
	import * as THREE from 'three';
	import { T } from '@threlte/core';
	import { garden } from './state.svelte';
	import { terrainHeight } from './terrain';
	import { nav } from './nav.svelte';

	const full = $derived(garden.tier === 'full');

	const X = -5;
	const Z = 2;
	const Y = terrainHeight(X, Z);
	// Face the garden center.
	const YAW = Math.atan2(0 - X, 0 - Z);

	const cursor = {
		onpointerenter: () => (document.body.style.cursor = 'pointer'),
		onpointerleave: () => (document.body.style.cursor = 'default')
	};

	function visitShed() {
		nav.walkTo('shed');
	}

	function openDoor(e: { stopPropagation: () => void }) {
		e.stopPropagation();
		nav.walkTo('shed');
		garden.panel = 'contact';
	}

	// Gable in-fill triangles under the roof slabs.
	const gableGeometry = (() => {
		const shape = new THREE.Shape();
		shape.moveTo(-1.32, 0);
		shape.lineTo(1.32, 0);
		shape.lineTo(0, 0.85);
		shape.closePath();
		return new THREE.ShapeGeometry(shape);
	})();

	const ROOF_ANGLE = Math.atan2(0.85, 1.32);
	const SLAB_LEN = Math.hypot(0.85, 1.32) + 0.25;
</script>

<T.Group position={[X, Y, Z]} rotation.y={YAW}>
	<!-- Stone plinth -->
	<T.Mesh position.y={0.06} receiveShadow={full}>
		<T.BoxGeometry args={[2.9, 0.16, 2.3]} />
		<T.MeshStandardMaterial color="#b8b0a0" flatShading />
	</T.Mesh>

	<!-- Walls -->
	<T.Mesh position.y={0.99} castShadow={full} onclick={visitShed} {...cursor}>
		<T.BoxGeometry args={[2.64, 1.7, 2.04]} />
		<T.MeshStandardMaterial color="#d9a05b" flatShading />
	</T.Mesh>

	<!-- Gable in-fills (front + back) -->
	{#each [1.021, -1.021] as gz (gz)}
		<T.Mesh geometry={gableGeometry} position={[0, 1.84, gz]} rotation.y={gz < 0 ? Math.PI : 0}>
			<T.MeshStandardMaterial color="#c98f4e" flatShading side={THREE.DoubleSide} />
		</T.Mesh>
	{/each}

	<!-- Roof slabs -->
	{#each [-1, 1] as side (side)}
		<T.Mesh
			position={[side * 0.66, 1.84 + 0.425, 0]}
			rotation.z={-side * ROOF_ANGLE}
			castShadow={full}
		>
			<T.BoxGeometry args={[SLAB_LEN, 0.09, 2.6]} />
			<T.MeshStandardMaterial color="#c95b3f" flatShading />
		</T.Mesh>
	{/each}
	<!-- Ridge cap -->
	<T.Mesh position={[0, 2.72, 0]} rotation.z={Math.PI / 4} castShadow={full}>
		<T.BoxGeometry args={[0.14, 0.14, 2.62]} />
		<T.MeshStandardMaterial color="#a34832" flatShading />
	</T.Mesh>

	<!-- Door (front) → contact panel -->
	<T.Group position={[0.55, 0.72, 1.03]}>
		<T.Mesh onclick={openDoor} {...cursor}>
			<T.BoxGeometry args={[0.66, 1.28, 0.07]} />
			<T.MeshStandardMaterial color="#7a4a2e" flatShading />
		</T.Mesh>
		<T.Mesh position={[-0.22, 0, 0.05]}>
			<T.SphereGeometry args={[0.045, 8, 6]} />
			<T.MeshStandardMaterial color="#e8c66a" flatShading />
		</T.Mesh>
	</T.Group>

	<!-- Window (front, other side of the door) -->
	<T.Group position={[-0.62, 1.15, 1.03]}>
		<T.Mesh>
			<T.BoxGeometry args={[0.62, 0.62, 0.06]} />
			<T.MeshStandardMaterial color="#f3ead6" flatShading />
		</T.Mesh>
		<T.Mesh position.z={0.02}>
			<T.BoxGeometry args={[0.5, 0.5, 0.06]} />
			<T.MeshStandardMaterial color="#bfe6f0" flatShading />
		</T.Mesh>
	</T.Group>

	<!-- Planter under the window -->
	<T.Group position={[-0.62, 0.32, 1.18]}>
		<T.Mesh>
			<T.BoxGeometry args={[0.7, 0.24, 0.26]} />
			<T.MeshStandardMaterial color="#8a5a3b" flatShading />
		</T.Mesh>
		{#each [
			{ x: -0.22, c: '#e86a8a' },
			{ x: 0, c: '#ffd97a' },
			{ x: 0.22, c: '#e86a8a' }
		] as flower (flower)}
			<T.Mesh position={[flower.x, 0.2, 0]}>
				<T.IcosahedronGeometry args={[0.09, 0]} />
				<T.MeshStandardMaterial color={flower.c} flatShading />
			</T.Mesh>
		{/each}
	</T.Group>
</T.Group>
