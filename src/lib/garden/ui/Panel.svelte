<script lang="ts">
	import { garden } from '../state.svelte';

	const SKILLS = ['Julia', 'Rust', 'Python', 'TypeScript', 'SQL', 'R', 'HTML / CSS', 'Svelte'];

	const DOMAINS = [
		'Agentic AI (MCP)',
		'Causal Inference',
		'Optimization & Simulation',
		'Labor Economics',
		'Geospatial Analytics',
		'Workforce Forecasting',
		'Statistical Modeling',
		'Regulatory Compliance'
	];

	const ABOUT = [
		`For over ten years at the U.S. Department of Labor, I've bridged the gap between data science and federal policy. My work spans the full pipeline: from data engineering to analysis, modeling, and forecasting — all the way through to deployment.`,
		`I specialize in architecting production-grade tools in Rust and Julia, building LLM-powered agents using the Model Context Protocol (MCP), and building models that answer real questions — like where the federal government should hire to best serve American workers.`,
		`I'm especially interested in problems where computation and statistics meet real-world consequence — where a model doesn't just describe the world but shapes budgets, enforcement strategy, or policy.`
	];

	function close() {
		garden.panel = null;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if garden.panel}
	<div class="panel" role="dialog" aria-label="Garden information">
		<button class="close" onclick={close} aria-label="Close panel">×</button>

		{#if garden.panel === 'about'}
			<h2>About</h2>
			{#each ABOUT as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
			<h3>Languages & Tools</h3>
			<div class="chips">
				{#each SKILLS as s (s)}<span class="chip">{s}</span>{/each}
			</div>
			<h3>Domains</h3>
			<div class="chips">
				{#each DOMAINS as d (d)}<span class="chip">{d}</span>{/each}
			</div>
		{:else if garden.panel === 'contact'}
			<h2>Get in touch</h2>
			<p>If something here piques your interest, let's get in touch!</p>
			<div class="links">
				<a href="mailto:mthelm85@gmail.com">
					<span class="label">Email</span>
					<span class="value">mthelm85@gmail.com</span>
				</a>
				<a href="https://github.com/mthelm85" target="_blank" rel="noopener noreferrer">
					<span class="label">GitHub</span>
					<span class="value">github.com/mthelm85</span>
				</a>
			</div>
		{:else if garden.panel === 'placard:sapling'}
			<p class="latin">Galton–Watson branching process</p>
			<h2>The Sapling</h2>
			<p class="planted">planted 2026</p>
			<p>
				A young tree grown by chance: each branch begets a random number of offshoots, and the
				whole crown is one realization of a branching process — the same mathematics Galton and
				Watson used to ask whether family names die out.
			</p>
			<p>
				It's still growing. Come back soon and you'll be able to regrow it yourself — a new random
				tree every time.
			</p>
		{/if}
	</div>
{/if}

<style>
	.panel {
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		bottom: 1.25rem;
		width: min(26rem, calc(100vw - 2.5rem));
		overflow-y: auto;
		background: #fffdf5;
		color: #2c3a2f;
		border: 2px solid #e5dcc3;
		border-radius: 18px;
		box-shadow: 0 18px 50px rgb(44 58 47 / 0.18);
		padding: 2rem 2.1rem;
		z-index: 15;
	}

	.close {
		position: absolute;
		top: 0.7rem;
		right: 0.9rem;
		font: inherit;
		font-size: 1.5rem;
		line-height: 1;
		background: none;
		border: none;
		color: #7a8a6e;
		cursor: pointer;
	}

	.close:hover {
		color: #2c3a2f;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		margin: 0 0 1rem;
	}

	h3 {
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #7a8a6e;
		margin: 1.4rem 0 0.6rem;
	}

	p {
		font-size: 0.95rem;
		line-height: 1.65;
		color: #55624e;
		margin: 0 0 0.9em;
	}

	.latin {
		font-size: 0.78rem;
		font-style: italic;
		color: #7a8a6e;
		margin: 0 0 0.2rem;
	}

	.planted {
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #b0a488;
		margin: -0.6rem 0 1rem;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip {
		font-size: 0.75rem;
		font-weight: 600;
		color: #3c8a46;
		background: #eef6e8;
		border: 1px solid #d3e6c8;
		border-radius: 999px;
		padding: 0.18rem 0.65rem;
	}

	.links {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		margin-top: 1.2rem;
	}

	.links a {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		transition: transform 0.15s ease;
	}

	.links a:hover {
		transform: translateX(4px);
	}

	.label {
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #7a8a6e;
	}

	.value {
		font-size: 1.02rem;
		font-weight: 700;
		color: #3c8a46;
	}
</style>
