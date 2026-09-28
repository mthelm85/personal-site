<script lang="ts">
	import { SKILLS, DOMAINS } from '$lib/data/identity';

	const PARAGRAPHS = [
		`For over ten years at the U.S. Department of Labor, I’ve worked at the intersection of data science, software engineering, and federal policy. My work spans the full pipeline: from data engineering and analysis to statistical modeling, forecasting, and deployment.`,
		`Put simply, I specialize in solving difficult problems. When a problem requires thinking outside the box, learning something new, or applying unfamiliar technologies and techniques, I draw on methods from statistics, mathematics, computing, and software engineering to build practical, actionable solutions.`,
		`I’m particularly interested in problems where computation and statistical methods meet real-world consequences—where a model doesn’t simply describe the world, but helps shape decisions about budgets, strategies, and policy.`,
	];
</script>

<section id="about" class="section" aria-labelledby="about-heading">
	<div class="section-inner">
		<h2 id="about-heading" class="section-heading bend">About</h2>

		<div class="about-prose">
			{#each PARAGRAPHS as paragraph}
				<p class="bend">{paragraph}</p>
			{/each}
		</div>

		<div class="skills-grid">
			<div class="skills-group bend">
				<div class="mono-label" style="margin-bottom: 13px;">Languages & Tools</div>
				<div class="skill-list">
					{#each SKILLS as skill}
						<span class="chip">{skill}</span>
					{/each}
				</div>
			</div>

			<div class="skills-group bend">
				<div class="mono-label" style="margin-bottom: 13px;">Domains</div>
				<div class="skill-list">
					{#each DOMAINS as domain}
						<span class="chip">{domain}</span>
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
		font-family: var(--font-body);
		font-size: 1.1rem;
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

	@media (max-width: 600px) {
		.section {
			padding: 55px 20px;
		}
		.about-prose p {
			font-size: 1rem;
		}
		.skills-grid {
			margin-top: 34px;
			gap: 21px;
		}
	}
</style>
