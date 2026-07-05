<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { activeSection } from '$lib/stores/scroll';

	import FlowField from '$lib/flow/FlowField.svelte';
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

<FlowField />

<section id="hero" class="hero">
	<h1 class="sr-only">Matt Helm</h1>
	<p class="tagline mono-label">
		<span class="term">data scientist</span>
		<span class="sep" aria-hidden="true">·</span>
		<span class="term">statistician</span>
		<span class="sep" aria-hidden="true">·</span>
		<span class="term">builder</span>
	</p>
	<a class="scroll-hint" href="#about" aria-label="Scroll down">↓</a>
</section>

<div class="flow-space" aria-hidden="true"></div>

<About />
<Projects />
<Experience />
<Contact />

<style>
	.hero {
		position: relative;
		z-index: 1;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		pointer-events: none;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	.tagline {
		letter-spacing: 0.22em;
		margin: 0 0 34px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 4px 16px;
		padding: 0 20px;
		text-align: center;
		max-width: 100%;
	}

	.term {
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.tagline {
			font-size: 15px;
			letter-spacing: 0.14em;
			gap: 3px 12px;
		}
	}

	@media (max-width: 420px) {
		.tagline {
			flex-direction: column;
			gap: 8px;
		}
		.sep {
			display: none;
		}
	}

	.scroll-hint {
		pointer-events: auto;
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: 18px;
		margin-bottom: 21px;
		animation: drift 2.4s ease-in-out infinite;
	}

	.scroll-hint:hover {
		color: var(--color-text-primary);
	}

	@keyframes drift {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-hint {
			animation: none;
		}
	}

	.flow-space {
		height: 60vh;
	}
</style>
