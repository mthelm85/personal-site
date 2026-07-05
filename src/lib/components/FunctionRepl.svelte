<script lang="ts">
	import { replOpen, currentEquation, replMode } from '$lib/stores/repl';
	import { fade } from 'svelte/transition';

	let inputEl = $state<HTMLInputElement | null>(null);
	let inputVal = $state('');
	let error = $state(false);
	let inputSeq = 0; // increments on each input, used to discard stale async results

	const HINTS = [
		'sin(x) * cos(y)',
		'x^2 + y^2',
		'atan2(y, x)',
		'sin(x * y)',
		'cos(x) + sin(y)',
		'atan2(x, y) * 2'
	];

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

		const { parseEquation } = await import('$lib/math/repl');
		const result = await parseEquation(val);

		// Discard if a newer input has fired since we started
		if (seq !== inputSeq) return;

		if (result.ok) {
			currentEquation.set(val);
			replMode.set('flowfield');
		} else {
			error = true;
		}
	}

	/** Submit: close overlay but keep the equation steering the field */
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
			replMode.set('flowfield');
			// Close overlay without reverting — equation stays active
			replOpen.set(false);
			inputVal = '';
		} else {
			error = true;
		}
	}

	/** Cancel: close overlay and revert to the default field */
	function close() {
		replOpen.set(false);
		inputVal = '';
		error = false;
		currentEquation.set('');
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
				<span class="label-sub">Your expression becomes a direction at every point. The sea of numbers follows the field.</span>
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
					→ Any math expression: f(x, y) = ...
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
