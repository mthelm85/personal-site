<script lang="ts">
	import { replOpen, currentEquation, replMode } from '$lib/stores/repl';
	import { activeSection } from '$lib/stores/scroll';
	import Katex from './Katex.svelte';

	// The flow field scales a user function by scroll progress, so it has no
	// effect on the hero (where the field spells the name). Hide the entry point
	// there rather than offer a control that appears to do nothing. The store
	// defaults to 'hero', which also keeps it hidden on pages with no field.
	let hidden = $derived($activeSection === 'hero');

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

<div class="equation-wrapper" class:hidden>
	<button
		class="equation-display"
		onclick={openRepl}
		aria-label="Open equation REPL"
	>
		<span class="eq-label"><Katex math={label()} /></span>
		<span class="cursor" aria-hidden="true"></span>
	</button>
</div>

<style>
	.equation-wrapper {
		transition:
			opacity 0.2s var(--ease-standard),
			visibility 0.2s var(--ease-standard);
	}

	/* visibility (not just opacity) takes the button out of the tab order and
	   the accessibility tree while hidden */
	.equation-wrapper.hidden {
		opacity: 0;
		visibility: hidden;
	}
</style>
