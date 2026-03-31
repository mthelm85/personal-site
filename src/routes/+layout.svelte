<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { replOpen } from '$lib/stores/repl';

	import AttractorCanvas from '$lib/components/AttractorCanvas.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import SectionDots from '$lib/components/SectionDots.svelte';
	import EquationDisplay from '$lib/components/EquationDisplay.svelte';
	import FunctionRepl from '$lib/components/FunctionRepl.svelte';


	let { children } = $props();

	onMount(() => {
		if (!browser) return;

		let cleanupKonami: (() => void) | undefined;

		// Konami code → Mandelbrot
		import('$lib/easter-eggs/konami').then(({ initKonami }) => {
			cleanupKonami = initKonami(() => {
				import('$lib/stores/repl').then(({ replMode }) => {
					replMode.set('mandelbrot');
				});
			});
		});

		const handleKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				replOpen.update((v) => !v);
			}
			if (e.key === 'Escape') {
				replOpen.set(false);
			}
		};
		window.addEventListener('keydown', handleKey);

		return () => {
			cleanupKonami?.();
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Matt Helm — Data Scientist</title>
</svelte:head>

<!-- Background attractor canvas -->
<AttractorCanvas />

<!-- Persistent UI layer -->
<Nav />
<SectionDots />
<EquationDisplay />
<FunctionRepl />

<!-- Page content -->
<main id="main-content" style="position: relative; z-index: 10;">
	{@render children()}
</main>
