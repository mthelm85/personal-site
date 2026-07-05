<script lang="ts">
	import * as THREE from 'three';
	import gsap from 'gsap';
	import { T, useTask } from '@threlte/core';
	import { garden } from './state.svelte';
	import { nav } from './nav.svelte';
	import { terrainHeight } from './terrain';
	import { sampleRealization, type Realization } from './galtonWatson';

	const full = $derived(garden.tier === 'full');
	const baseY = terrainHeight(0, 0);

	/** Seconds per generation in the growth stagger. */
	const GEN_STEP = 0.45;

	// Shared unit branch: height 1 with base at origin, tapered.
	const branchGeometry = (() => {
		const geo = new THREE.CylinderGeometry(0.72, 1, 1, 6);
		geo.translate(0, 0.5, 0);
		return geo;
	})();
	const leafGeometry = new THREE.IcosahedronGeometry(1, 0);
	const woodMaterial = new THREE.MeshStandardMaterial({
		color: '#8a5a3b',
		flatShading: true,
		roughness: 1
	});

	const LEAF_COLORS = ['#3e9b4f', '#4fae5c', '#7ec850'];
	const BLOSSOM = '#e86a8a';

	const UP = new THREE.Vector3(0, 1, 0);

	let realizationCount = 0;
	let realization = $state<Realization>(publish(sampleRealization()));

	function publish(r: Realization): Realization {
		realizationCount += 1;
		garden.gw = {
			total: r.total,
			generations: r.generations,
			populations: r.populations,
			extinct: r.extinct,
			truncated: r.truncated,
			realization: realizationCount
		};
		return r;
	}

	interface BranchView {
		key: string;
		position: THREE.Vector3;
		quaternion: THREE.Quaternion;
		scale: THREE.Vector3;
		generation: number;
		leaf: { position: THREE.Vector3; scale: number; color: string } | null;
	}

	const views = $derived(
		realization.branches.map((b, i): BranchView => {
			const q = new THREE.Quaternion().setFromUnitVectors(UP, b.dir);
			return {
				key: `${garden.gw?.realization ?? 0}-${i}`,
				position: b.start,
				quaternion: q,
				scale: new THREE.Vector3(b.radius, b.length, b.radius),
				generation: b.generation,
				leaf: b.terminal
					? {
							position: b.start.clone().addScaledVector(b.dir, b.length),
							scale: 0.1 + b.radius * 1.6,
							color: Math.random() < 0.12 ? BLOSSOM : LEAF_COLORS[i % LEAF_COLORS.length]
						}
					: null
			};
		})
	);

	/* Growth: every mesh starts at zero scale and springs up, staggered by
	   generation — you watch the process generate itself. */
	function growBranch(mesh: THREE.Mesh, view: BranchView) {
		gsap.fromTo(
			mesh.scale,
			{ x: 0.001, y: 0.001, z: 0.001 },
			{
				x: view.scale.x,
				y: view.scale.y,
				z: view.scale.z,
				duration: 0.55,
				ease: 'back.out(1.6)',
				delay: view.generation * GEN_STEP + Math.random() * 0.2
			}
		);
	}

	function growLeaf(mesh: THREE.Mesh, view: BranchView) {
		const s = view.leaf!.scale;
		gsap.fromTo(
			mesh.scale,
			{ x: 0.001, y: 0.001, z: 0.001 },
			{
				x: s,
				y: s,
				z: s,
				duration: 0.45,
				ease: 'back.out(2)',
				delay: view.generation * GEN_STEP + 0.3 + Math.random() * 0.2
			}
		);
	}

	let group: THREE.Group | undefined = $state();
	let busy = false;

	function regrow() {
		if (busy || !group) return;
		// Walk over first; regrow when you're standing at the tree.
		if (nav.current !== 'sapling') {
			nav.walkTo('sapling');
			return;
		}
		busy = true;
		gsap.to(group.scale, {
			x: 0.001,
			y: 0.001,
			z: 0.001,
			duration: 0.35,
			ease: 'power2.in',
			onComplete: () => {
				realization = publish(sampleRealization());
				group!.scale.set(1, 1, 1);
				const growTime = (garden.gw!.generations + 1) * GEN_STEP + 1.2;
				gsap.delayedCall(growTime, () => (busy = false));
			}
		});
	}

	const cursor = {
		onpointerenter: () => (document.body.style.cursor = 'pointer'),
		onpointerleave: () => (document.body.style.cursor = 'default')
	};

	// The whole realization sways as one organism.
	let sway = $state(0);
	let t = 0;
	useTask((delta) => {
		t += delta;
		sway = Math.sin(t * 1.1) * 0.03;
	});
</script>

<T.Group position={[0, baseY, 0]} rotation.z={sway} bind:ref={group}>
	{#each views as view (view.key)}
		<T.Mesh
			geometry={branchGeometry}
			material={woodMaterial}
			position={[view.position.x, view.position.y, view.position.z]}
			quaternion={[view.quaternion.x, view.quaternion.y, view.quaternion.z, view.quaternion.w]}
			castShadow={full}
			onclick={(e) => {
				e.stopPropagation();
				regrow();
			}}
			{...cursor}
			oncreate={(mesh) => growBranch(mesh, view)}
		/>
		{#if view.leaf}
			<T.Mesh
				geometry={leafGeometry}
				position={[view.leaf.position.x, view.leaf.position.y, view.leaf.position.z]}
				castShadow={full}
				onclick={(e) => {
					e.stopPropagation();
					regrow();
				}}
				{...cursor}
				oncreate={(mesh) => growLeaf(mesh, view)}
			>
				<T.MeshStandardMaterial color={view.leaf.color} flatShading roughness={1} />
			</T.Mesh>
		{/if}
	{/each}
</T.Group>
