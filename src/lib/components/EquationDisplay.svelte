<script lang="ts">
	import { replOpen, currentEquation, replMode } from '$lib/stores/repl';
	import Katex from './Katex.svelte';

	let label = $derived(() => {
		// If the user has submitted an equation via the REPL, show that
		if ($currentEquation && $replMode === 'flowfield') {
			return $currentEquation;
		}
		return 'f(x, y)';
	});

	function openRepl() {
		replOpen.set(true);
	}
</script>

<div class="equation-wrapper">
	<button
		class="equation-display"
		onclick={openRepl}
		aria-label="Open equation REPL"
	>
		<span class="eq-label"><Katex math={label()} /></span>
		<span class="cursor" aria-hidden="true"></span>
	</button>
</div>
