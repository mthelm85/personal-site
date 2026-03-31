<script lang="ts">
	import { replOpen, currentEquation, replMode, sectionLabels } from '$lib/stores/repl';
	import { activeSection } from '$lib/stores/scroll';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let inputEl = $state<HTMLInputElement | null>(null);
	let inputVal = $state('');
	let error = $state(false);
	let inputSeq = 0; // increments on each input, used to discard stale async results

	const HINTS = [
		'sin(x) * cos(y)',
		'x^2 + y^2',
		'atan2(y, x)',
		'euler',
		'mandelbrot',
		'lorenz',
		'conway',
		'fibonacci'
	];

	const SPECIAL: Record<string, string> = {
		euler: 'Golden sparkle — Euler\'s identity animation',
		mandelbrot: 'Interactive Mandelbrot explorer (scroll to zoom, drag to pan)',
		lorenz: 'Lorenz attractor — the butterfly effect',
		conway: "Conway's Game of Life",
		fibonacci: 'Golden ratio spiral overlay',
		golden: 'Golden ratio spiral overlay'
	};

	let hintText = $derived(
		Object.keys(SPECIAL).includes(inputVal.trim().toLowerCase())
			? SPECIAL[inputVal.trim().toLowerCase() as keyof typeof SPECIAL]
			: 'Any math expression: f(x, y) = ...'
	);

	$effect(() => {
		if ($replOpen && inputEl) {
			setTimeout(() => inputEl?.focus(), 50);
			inputVal = '';
			error = false;
		}
	});

	async function handleInput() {
		error = false;
		const seq = ++inputSeq;
		const val = inputVal.trim();
		if (!val) {
			currentEquation.set('');
			replMode.set('default');
			return;
		}

		// Don't try to parse special commands as math
		if (val.toLowerCase() in SPECIAL) {
			return;
		}

		const { parseEquation } = await import('$lib/math/repl');
		const result = await parseEquation(val);

		// Discard if a newer input has fired since we started
		if (seq !== inputSeq) return;

		if (result.ok) {
			currentEquation.set(val);
			replMode.set(result.mode ?? 'default');
		} else {
			error = true;
		}
	}

	/** Submit: close overlay but keep the equation rendering on the canvas */
	async function submit() {
		error = false;
		const val = inputVal.trim();
		if (!val) {
			close();
			return;
		}

		const { parseEquation } = await import('$lib/math/repl');
		const result = await parseEquation(val);

		if (result.ok) {
			currentEquation.set(val);
			replMode.set(result.mode ?? 'default');
			// Close overlay without reverting — equation stays active
			replOpen.set(false);
			inputVal = '';
		} else {
			error = true;
		}
	}

	/** Cancel: close overlay and revert to section default */
	function close() {
		replOpen.set(false);
		inputVal = '';
		error = false;
		// Return to section default
		const section = $activeSection;
		currentEquation.set($sectionLabels[section] ?? '');
		replMode.set('default');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
		if (e.key === 'Enter') submit();
	}
</script>

{#if $replOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="repl-overlay"
		role="presentation"
		transition:fade={{ duration: 150 }}
		onclick={(e) => e.target === e.currentTarget && close()}
	>
		<div
			class="repl-palette"
			role="dialog"
			aria-modal="true"
			aria-label="Function REPL"
		>
			<div class="repl-header">
				<span class="label">Function REPL — f(x, y) → angle, rendered as a flow field</span>
				<span class="label-sub">Your expression becomes a direction at every point. Particles follow the field.</span>
			</div>

			<input
				bind:this={inputEl}
				bind:value={inputVal}
				class="repl-input"
				class:error
				type="text"
				placeholder="f(x, y) = sin(x) * cos(y)"
				oninput={handleInput}
				onkeydown={handleKeydown}
				autocomplete="off"
				spellcheck="false"
			/>

			<div class="repl-hint">
				{#if error}
					<span style="color: #c09080;">Invalid expression — check syntax</span>
				{:else if inputVal}
					→ {hintText}
				{:else}
					Try: {HINTS[Math.floor(Date.now() / 5000) % HINTS.length]} · Enter to apply · Esc to cancel
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.repl-input.error {
		color: #c09080;
	}

</style>
