<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { terrainHeight } from './terrain';
	import { WAYPOINTS, neighborsOf } from './waypoints';
	import { nav } from './nav.svelte';
	import { garden } from './state.svelte';

	let hovered = $state<string | null>(null);
	let pulse = $state(0);
	let bob = $state(0);
	let spin = $state(0);
	let t = 0;
	useTask((delta) => {
		t += delta;
		pulse = 1 + 0.07 * Math.sin(t * 2.4);
		bob = 0.08 * Math.sin(t * 1.8);
		spin = t * 0.9;
	});

	// Only show waypoints you could sensibly walk to: everything but the
	// one you're standing on. (All are reachable — BFS walks the path.)
	const visible = $derived(WAYPOINTS.filter((w) => w.id !== nav.current));

	function enter(id: string) {
		if (nav.traveling) return;
		hovered = id;
		document.body.style.cursor = 'pointer';
	}

	function leave(id: string) {
		if (hovered === id) hovered = null;
		document.body.style.cursor = 'default';
	}

	function activate(id: string) {
		hovered = null;
		document.body.style.cursor = 'default';
		nav.walkTo(id);
	}

	/** Tab / arrows cycle the current node's neighbors; Enter walks. */
	function onKeydown(e: KeyboardEvent) {
		// Keep Tab native while DOM overlays (landing, panels) are up.
		if (!garden.entered || garden.panel !== null) return;
		if (nav.traveling) return;
		const ring = neighborsOf(nav.current);
		if (ring.length === 0) return;

		if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
			e.preventDefault();
			const dir = e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey) ? -1 : 1;
			const idx = nav.focused ? ring.indexOf(nav.focused) : -1;
			nav.focused = ring[(idx + dir + ring.length) % ring.length];
		} else if (e.key === 'Enter' && nav.focused) {
			e.preventDefault();
			activate(nav.focused);
		} else if (e.key === 'Escape') {
			nav.focused = null;
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#each visible as wp (wp.id)}
	{@const y = terrainHeight(wp.x, wp.z)}
	{@const hot = hovered === wp.id || nav.focused === wp.id}
	{@const handlers = {
		onclick: () => activate(wp.id),
		onpointerenter: () => enter(wp.id),
		onpointerleave: () => leave(wp.id)
	}}
	<T.Group position={[wp.x, y, wp.z]}>
		<!-- Stepping stone grounding the marker in the clearing -->
		<T.Mesh position.y={0.04} {...handlers}>
			<T.CylinderGeometry args={[0.62, 0.72, 0.1, 9]} />
			<T.MeshStandardMaterial color={hot ? '#e8e2d2' : '#cfc8b8'} flatShading />
		</T.Mesh>
		<!-- Glow ring -->
		<T.Mesh rotation.x={-Math.PI / 2} position.y={0.12} scale={hot ? 1.25 : pulse} {...handlers}>
			<T.TorusGeometry args={[0.55, 0.06, 10, 28]} />
			<T.MeshBasicMaterial
				color={hot ? '#ffffff' : nav.focused === wp.id ? '#ffd97a' : '#fff3b0'}
				transparent
				opacity={hot ? 0.95 : 0.7}
			/>
		</T.Mesh>
		<!-- Floating gem, visible above the grass -->
		<T.Mesh
			position.y={1.0 + bob}
			rotation.y={spin}
			scale={hot ? 1.35 : 1}
			{...handlers}
		>
			<T.OctahedronGeometry args={[0.16, 0]} />
			<T.MeshBasicMaterial color={hot ? '#ffffff' : '#ffd97a'} transparent opacity={0.9} />
		</T.Mesh>
	</T.Group>
{/each}
