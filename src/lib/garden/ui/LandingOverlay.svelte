<script lang="ts">
	import { garden } from '../state.svelte';
	import { nav } from '../nav.svelte';

	function walkIn() {
		garden.entered = true;
		nav.walkTo('path');
	}
</script>

<div class="landing" role="dialog" aria-labelledby="landing-name">
	<div class="card">
		<p class="role">Staff Data Scientist · Software Engineer</p>
		<h1 id="landing-name">Matt Helm</h1>
		<p class="tagline">I solve problems using data, statistics, and artificial intelligence.</p>

		<button class="walk" onclick={walkIn}>Walk in →</button>

		<p class="fastpath">
			In a hurry?
			<a href="mailto:mthelm85@gmail.com">mthelm85@gmail.com</a>
			·
			<a href="https://github.com/mthelm85" target="_blank" rel="noopener noreferrer">GitHub</a>
		</p>
	</div>
</div>

<style>
	.landing {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		background: color-mix(in srgb, #aee1f9 35%, transparent);
		backdrop-filter: blur(3px);
		z-index: 20;
	}

	.card {
		background: #fffdf5;
		color: #2c3a2f;
		border-radius: 22px;
		border: 2px solid #e5dcc3;
		box-shadow: 0 18px 50px rgb(44 58 47 / 0.18);
		padding: 2.6rem 3rem;
		max-width: 27rem;
		text-align: center;
	}

	.role {
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #7a8a6e;
		margin: 0 0 0.6rem;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0 0 0.7rem;
	}

	.tagline {
		font-size: 1.02rem;
		line-height: 1.55;
		color: #55624e;
		margin: 0 0 1.7rem;
	}

	.walk {
		font: inherit;
		font-weight: 700;
		font-size: 1.05rem;
		color: #fffdf5;
		background: #4b9a52;
		border: none;
		border-radius: 999px;
		padding: 0.75rem 2.2rem;
		cursor: pointer;
		transition:
			transform 0.15s ease,
			background 0.15s ease;
	}

	.walk:hover {
		background: #3c8a46;
		transform: translateY(-2px);
	}

	.fastpath {
		margin: 1.6rem 0 0;
		font-size: 0.82rem;
		color: #7a8a6e;
	}

	.fastpath a {
		color: #3c8a46;
		font-weight: 600;
		text-decoration: none;
	}

	.fastpath a:hover {
		text-decoration: underline;
	}
</style>
