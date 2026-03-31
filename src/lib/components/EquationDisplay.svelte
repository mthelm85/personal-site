<script lang="ts">
	import { activeSection } from '$lib/stores/scroll';
	import { replOpen, currentEquation, replMode, sectionLabels } from '$lib/stores/repl';
	import Katex from './Katex.svelte';

	let label = $derived(() => {
		// If user has submitted an equation via REPL, show that
		if ($currentEquation && $replMode !== 'default') {
			return $currentEquation;
		}
		return $sectionLabels[$activeSection] ?? 'f(x, y)';
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
	<div class="equation-tooltip">
		Each expression is evaluated as an angle at every (x, y) point, creating a flow field. Particles follow the resulting vector field. Press Ctrl+K to try your own.
	</div>
</div>
