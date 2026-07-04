<script lang="ts">
	import './garden.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Matt Helm — Data Scientist</title>
</svelte:head>

{@render children()}
