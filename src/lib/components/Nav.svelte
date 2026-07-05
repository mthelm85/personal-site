<script lang="ts">
	import { activeSection } from '$lib/stores/scroll';

	const SECTIONS = [
		{ id: 'hero', label: 'Start' },
		{ id: 'about', label: 'About' },
		{ id: 'projects', label: 'Fun Stuff' },
		{ id: 'experience', label: 'Experience' },
		{ id: 'contact', label: 'Contact' }
	];

	function scrollTo(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<nav
	class="nav-bar fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
>
	<!-- Nav links -->
	<ul class="flex gap-8 list-none m-0 p-0" style="margin-left: auto;">
		{#each SECTIONS as section}
			<li>
				<button
					onclick={() => scrollTo(section.id)}
					class="nav-link {$activeSection === section.id ? 'active' : ''}"
					aria-label="Navigate to {section.label}"
					style="background: none; border: none; padding: 0; cursor: pointer;"
				>
					{section.label}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.nav-bar {
		background: linear-gradient(
			to bottom,
			rgba(var(--color-bg-rgb), 0.9) 0%,
			rgba(var(--color-bg-rgb), 0) 100%
		);
		backdrop-filter: blur(1px);
	}

	.nav-bar::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		height: 80px;
		background: linear-gradient(
			to bottom,
			rgba(var(--color-bg-rgb), 0.12) 0%,
			rgba(var(--color-bg-rgb), 0) 100%
		);
		pointer-events: none;
	}

	.nav-link {
		font-family: 'MattHelm', Georgia, serif;
		font-size: 18px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color 0.2s;
	}
	.nav-link:hover,
	.nav-link.active {
		color: var(--color-text-primary);
	}

	@media (max-width: 600px) {
		nav {
			padding: 12px 16px;
		}
		ul {
			gap: 10px;
			margin-left: 0;
			justify-content: center;
			width: 100%;
		}
		.nav-link {
			font-size: 12px;
			letter-spacing: 0.03em;
		}
	}
</style>
