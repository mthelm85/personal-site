<script lang="ts">
	import { activeSection } from '$lib/stores/scroll';

	const SECTIONS = [
		{ id: 'hero', label: 'Home' },
		{ id: 'about', label: 'About' },
		{ id: 'projects', label: 'Fun Stuff' },
		{ id: 'experience', label: 'Experience' },
		{ id: 'contact', label: 'Contact' }
	];

	function scrollTo(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<div class="section-dots" aria-label="Page sections">
	{#each SECTIONS as section}
		<button
			class="section-dot {$activeSection === section.id ? 'active' : ''}"
			onclick={() => scrollTo(section.id)}
			aria-label="Navigate to {section.label}"
			title={section.label}
		></button>
	{/each}
</div>
