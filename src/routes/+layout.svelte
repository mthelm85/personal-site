<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { replOpen } from '$lib/stores/repl';

	import Nav from '$lib/components/Nav.svelte';
	import EquationDisplay from '$lib/components/EquationDisplay.svelte';
	import FunctionRepl from '$lib/components/FunctionRepl.svelte';

	let { children } = $props();

	onMount(() => {
		if (!browser) return;

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
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Matt Helm — Data Scientist</title>
</svelte:head>

<!-- Persistent UI layer -->
<Nav />
<EquationDisplay />
<FunctionRepl />

<!-- Page content -->
<main id="main-content" style="position: relative; z-index: 10;">
	{@render children()}
</main>
