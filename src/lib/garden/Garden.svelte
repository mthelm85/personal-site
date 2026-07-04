<script lang="ts">
	import { onMount } from 'svelte';
	import { PCFShadowMap } from 'three';
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import LandingOverlay from './ui/LandingOverlay.svelte';
	import Panel from './ui/Panel.svelte';
	import { probeCapability } from './capability';
	import { garden } from './state.svelte';
	import { nav } from './nav.svelte';

	onMount(async () => {
		const report = await probeCapability();
		console.info(
			`[garden] tier=${report.tier} (${report.reason})`,
			report
		);
		garden.report = report;
	});

	const dpr = $derived(
		garden.tier === 'full' ? Math.min(devicePixelRatio ?? 1, 2) : 1
	);
</script>

{#if garden.report === null}
	<!-- Placeholder while probing; the seed-sprout loader replaces this in M5. -->
	<div class="garden-probe" aria-hidden="true"></div>
{:else if garden.tier === 'none'}
	<!-- Flat fallback. Redirects to the complete /plain site once it exists (M6). -->
	<div class="garden-fallback">
		<h1>Matt Helm</h1>
		<p>Data scientist. Statistician's garden under construction — this device can't render it, but the full plain-text site is on its way.</p>
		<p><a href="mailto:mthelm85@gmail.com">mthelm85@gmail.com</a></p>
	</div>
{:else}
	<div class="garden-canvas">
		<Canvas {dpr} shadows={garden.tier === 'full' ? PCFShadowMap : false}>
			<Scene />
		</Canvas>
	</div>

	{#if !garden.entered}
		<LandingOverlay />
	{:else}
		<Panel />
		{#if !garden.panel && !nav.traveling}
			<p class="hint">Click a glowing marker to walk — or tap Tab, then Enter</p>
		{/if}
	{/if}
{/if}

<style>
	.garden-canvas,
	.garden-probe {
		position: fixed;
		inset: 0;
	}

	.garden-probe {
		background: #aee1f9;
	}

	.garden-fallback {
		min-height: 100vh;
		display: grid;
		place-content: center;
		text-align: center;
		gap: 0.5rem;
		padding: 2rem;
	}

	.hint {
		position: fixed;
		bottom: 1.4rem;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.82rem;
		font-weight: 600;
		color: #2c3a2f;
		background: color-mix(in srgb, #fffdf5 85%, transparent);
		border: 1px solid #e5dcc3;
		border-radius: 999px;
		padding: 0.45rem 1.1rem;
		z-index: 10;
		pointer-events: none;
	}
</style>
