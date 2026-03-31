<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { activeSection } from '$lib/stores/scroll';
	import { replMode, currentEquation, sectionLabels } from '$lib/stores/repl';
	import { AttractorRenderer } from '$lib/attractors/renderer';
	import { getPerformanceTier, getIterationsPerFrame } from '$lib/utils/detectPerformance';
	import { generateSectionVisuals, type SectionVisuals } from '$lib/utils/randomVisuals';

	let canvas: HTMLCanvasElement;
	let renderer: AttractorRenderer | null = null;
	let specialRenderer: { start(): void; stop(): void } | null = null;

	// Generated once per page load — unique every session
	let visuals: SectionVisuals;

	function applySection(section: string) {
		if (!renderer) return;
		const flowField = visuals.flowFields[section];
		if (flowField) {
			renderer.setFlowField(flowField.fn);
			if (!renderer.running) renderer.start();
		} else {
			const preset = visuals.attractors[section];
			if (preset) {
				renderer.setFlowField(null);
				// Clear canvas when switching away from flow field to attractor
				const ctx = canvas.getContext('2d');
				if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
				renderer.setPreset(preset);
				if (!renderer.running) renderer.start();
			}
		}
	}

	onMount(() => {
		if (!browser) return;

		visuals = generateSectionVisuals();

		// Populate section labels for EquationDisplay / FunctionRepl
		const labels: Record<string, string> = {};
		for (const [k, v] of Object.entries(visuals.attractors)) labels[k] = v.label ?? '';
		for (const [k, v] of Object.entries(visuals.flowFields)) labels[k] = v.label;
		sectionLabels.set(labels);

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(window.innerWidth * dpr);
		canvas.height = Math.round(window.innerHeight * dpr);
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';

		const iters = getIterationsPerFrame(getPerformanceTier());
		renderer = new AttractorRenderer(canvas, visuals.attractors['hero'], iters);
		renderer.start();

		const onResize = () => renderer?.resize();
		window.addEventListener('resize', onResize);

		return () => {
			renderer?.stop();
			specialRenderer?.stop();
			window.removeEventListener('resize', onResize);
		};
	});

	// Section change → use randomized flow field or attractor preset
	$effect(() => {
		const section = $activeSection;
		const mode = $replMode;
		if (!renderer || !visuals || mode !== 'default') return;
		applySection(section);
	});

	// REPL mode change
	$effect(() => {
		const mode = $replMode;
		if (!canvas || !browser || !visuals) return;

		if (mode === 'mandelbrot') {
			specialRenderer?.stop();
			renderer?.stop();
			const ctx = canvas.getContext('2d')!;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			import('$lib/math/mandelbrot').then(({ MandelbrotRenderer }) => {
				specialRenderer = new MandelbrotRenderer(canvas);
				specialRenderer.start();
			});
		} else if (mode === 'conway') {
			specialRenderer?.stop();
			renderer?.stop();
			const ctx = canvas.getContext('2d')!;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			import('$lib/math/conway').then(({ ConwayRenderer }) => {
				specialRenderer = new ConwayRenderer(canvas);
				specialRenderer.start();
			});
		} else if (mode === 'lorenz') {
			specialRenderer?.stop();
			specialRenderer = null;
			if (renderer) {
				if (!renderer.running) renderer.start();
				renderer.setFlowField(null);
				renderer.setPreset(visuals.attractors['hero']);
			}
		} else if (mode === 'default' || mode === 'euler') {
			specialRenderer?.stop();
			specialRenderer = null;
			if (renderer) {
				if (!renderer.running) renderer.start();
				applySection($activeSection);
			}
		}
	});

	// Flow field for arbitrary equations (REPL overrides section visuals)
	$effect(() => {
		const eq = $currentEquation;
		const mode = $replMode;
		if (!renderer || !eq || mode !== 'flowfield') return;

		import('$lib/math/repl').then(async ({ parseEquation }) => {
			const result = await parseEquation(eq);
			if (result.ok && result.fn && renderer) {
				if (!renderer.running) renderer.start();
				renderer.setFlowField(result.fn);
			}
		});
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 pointer-events-none"
	style="z-index: 0;"
	aria-hidden="true"
></canvas>
