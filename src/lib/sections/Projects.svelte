<script lang="ts">
	import { PROJECTS } from '$lib/data/projects';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
</script>

<section id="projects" class="section" aria-labelledby="projects-heading">
	<div class="section-inner">
		<h2 id="projects-heading" class="section-heading">Fun Stuff</h2>

		<p class="section-intro">
			Games, notebooks, blogs, and tools — things built for the love of the problem.
		</p>

		<div class="projects-grid">
			{#each PROJECTS as project}
				<ProjectCard {project} />
			{/each}
		</div>
	</div>
</section>

<style>
	.section {
		min-height: 100vh;
		padding: 89px clamp(24px, 8vw, 144px);
	}

	.section-inner {
		max-width: 900px;
		width: 100%;
	}

	.section-intro {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: 1rem;
		color: #9a98b0;
		margin: 21px 0 55px;
		font-style: italic;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 21px;
	}

	@media (max-width: 600px) {
		.section {
			padding: 55px 20px;
		}
		.section-intro {
			margin: 13px 0 34px;
		}
		.projects-grid {
			grid-template-columns: 1fr;
			gap: 13px;
		}
	}
</style>
