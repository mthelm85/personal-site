<script lang="ts">
	const SKILLS = [
		'Julia',
		'Rust',
		'Python',
		'TypeScript',
		'SQL',
		'R',
		'HTML / CSS',
		'Svelte'
	];

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

	const PARAGRAPHS = [
		`For over ten years at the U.S. Department of Labor, I’ve bridged the gap between data science and federal policy. My work spans the full pipeline: from data engineering to analysis, modeling, and forecasting — all the way through to deployment.`,
		`I specialize in architecting production-grade tools in Rust and Julia, building LLM-powered agents using the Model Context Protocol (MCP), and building models that answer real questions — like where the federal government should hire to best serve American workers.`,
		`I'm especially interested in problems where computation and statistics meet real-world consequence — where a model doesn't just describe the world but shapes budgets, enforcement strategy, or policy.`,
	];
</script>

<section id="about" class="section" aria-labelledby="about-heading">
	<div class="section-inner">
		<h2 id="about-heading" class="section-heading">About</h2>

		<div class="about-prose">
			{#each PARAGRAPHS as paragraph}
				<p>{paragraph}</p>
			{/each}
		</div>

		<div class="skills-grid">
			<div class="skills-group">
				<div class="mono-label" style="margin-bottom: 13px;">Languages & Tools</div>
				<div class="skill-list">
					{#each SKILLS as skill}
						<span class="skill-item">{skill}</span>
					{/each}
				</div>
			</div>

			<div class="skills-group">
				<div class="mono-label" style="margin-bottom: 13px;">Domains</div>
				<div class="skill-list">
					{#each DOMAINS as domain}
						<span class="skill-item">{domain}</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.section {
		min-height: 100vh;
		padding: 89px clamp(24px, 8vw, 144px);
		display: flex;
		align-items: flex-start;
	}

	.section-inner {
		max-width: 680px;
		width: 100%;
	}

	.about-prose {
		margin-top: 34px;
	}

	.about-prose p {
		font-family: 'MattHelm', Georgia, serif;
		font-size: 1.45rem;
		line-height: 1.75;
		color: var(--color-text-secondary);
		margin: 0 0 1.4em;
	}

	.skills-grid {
		margin-top: 55px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 34px;
	}

	@media (max-width: 560px) {
		.skills-grid {
			grid-template-columns: 1fr;
		}
	}

	.skill-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.skill-item {
		font-family: 'MattHelm', Georgia, serif;
		font-size: 18px;
		color: var(--color-text-secondary);
		padding: 6px 16px;
		border: 1px solid var(--color-border-light);
		border-radius: 2px;
		transition:
			border-color 0.3s,
			color 0.3s;
	}

	.skill-item:hover {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	@media (max-width: 600px) {
		.section {
			padding: 55px 20px;
		}
		.about-prose p {
			font-size: 1.3rem;
		}
		.skills-grid {
			margin-top: 34px;
			gap: 21px;
		}
		.skill-item {
			font-size: 16px;
			padding: 5px 14px;
		}
	}
</style>
