<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { replOpen } from '$lib/stores/repl';

	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();

	// The equation display + REPL pull in KaTeX (a heavy dependency). They're
	// decorative/interactive overlays, not initial content, so we lazy-load them
	// once the browser is idle — keeping KaTeX out of the initial parse so it does
	// not compete with first paint and the flow-field startup on slow devices.
	let EquationDisplay = $state<any>(null);
	let FunctionRepl = $state<any>(null);

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

		const loadRepl = () => {
			import('$lib/components/EquationDisplay.svelte').then((m) => (EquationDisplay = m.default));
			import('$lib/components/FunctionRepl.svelte').then((m) => (FunctionRepl = m.default));
		};
		const w = window as any;
		const idleId = w.requestIdleCallback
			? w.requestIdleCallback(loadRepl, { timeout: 3000 })
			: window.setTimeout(loadRepl, 1200);

		return () => {
			window.removeEventListener('keydown', handleKey);
			if (w.cancelIdleCallback) w.cancelIdleCallback(idleId);
			else clearTimeout(idleId);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Matt Helm — Data Scientist</title>
</svelte:head>

<!-- Persistent UI layer -->
<Nav />
{#if EquationDisplay}<EquationDisplay />{/if}
{#if FunctionRepl}<FunctionRepl />{/if}

<!-- Page content -->
<main id="main-content" style="position: relative; z-index: 10;">
	{@render children()}
</main>
