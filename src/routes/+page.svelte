<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { activeSection } from '$lib/stores/scroll';

	import Hero from '$lib/sections/Hero.svelte';
	import About from '$lib/sections/About.svelte';
	import Projects from '$lib/sections/Projects.svelte';
	import Experience from '$lib/sections/Experience.svelte';
	import Contact from '$lib/sections/Contact.svelte';

	const SECTION_IDS = ['hero', 'about', 'projects', 'experience', 'contact'];

	onMount(() => {
		if (!browser) return;

		// IntersectionObserver to track active section
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSection.set(entry.target.id);
					}
				}
			},
			{
				threshold: 0.35,
				rootMargin: '-10% 0px -10% 0px'
			}
		);

		for (const id of SECTION_IDS) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

<Hero />
<About />
<Projects />
<Experience />
<Contact />
