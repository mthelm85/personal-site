<script lang="ts">
	import type { Project } from '$lib/data/projects';

	let { project }: { project: Project } = $props();

	let card: HTMLElement;

	const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

	function handleMouseMove(e: MouseEvent) {
		if (!card || isTouch) return;
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateX = ((y - centerY) / centerY) * -4;
		const rotateY = ((x - centerX) / centerX) * 4;
		card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
	}

	function handleMouseLeave() {
		if (!card) return;
		card.style.transform = '';
	}
</script>

<!-- The wrapper carries the scroll bend; the article keeps its own tilt transform. -->
<div class="card-slot bend">
<article
	bind:this={card}
	class="project-card"
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	<h3>{project.title}</h3>
	<p>{project.description}</p>

	<div class="flex flex-wrap gap-2 mb-3">
		{#each project.tech as tag}
			<span class="chip">{tag}</span>
		{/each}
	</div>

	{#if project.github || project.link}
		<div class="flex gap-4" style="font-family: var(--font-label); font-size: 13px;">
			{#if project.github}
				<a href={project.github} target="_blank" rel="noopener noreferrer" style="color: var(--color-accent-hi);"
					>GitHub →</a
				>
			{/if}
			{#if project.link}
				<a href={project.link} target="_blank" rel="noopener noreferrer" style="color: var(--color-accent-hi);"
					>View →</a
				>
			{/if}
		</div>
	{/if}
</article>
</div>

<style>
	/* Keep cards in a grid row equal height through the wrapper */
	.card-slot {
		display: flex;
	}
	.card-slot > .project-card {
		flex: 1;
	}
</style>
