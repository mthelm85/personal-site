<script lang="ts">
	import katex from 'katex';

	let { math, display = false }: { math: string; display?: boolean } = $props();

	let html = $derived(
		katex.renderToString(math, {
			throwOnError: false,
			displayMode: display,
			output: 'html'
		})
	);
</script>

<span class="katex-wrapper" class:display>{@html html}</span>

<style>
	.katex-wrapper {
		display: inline;
	}
	.katex-wrapper.display {
		display: block;
		text-align: center;
	}
</style>
