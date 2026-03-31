<script lang="ts">
	import mattSquare from '$lib/assets/matt_square.jpg';
</script>

<section
	id="hero"
	class="section-hero"
	aria-labelledby="hero-name"
>
	<div class="hero-inner">
		<div class="hero-content">
			<div class="hero-label mono-label" aria-hidden="true">Staff Data Scientist&ensp;·&ensp;Software Engineer</div>

			<h1 id="hero-name" class="hero-name">Matt Helm</h1>

			<p class="hero-tagline">I solve problems using data, statistics, and artificial intelligence.</p>
		</div>

		<div class="hero-portrait">
			<img src={mattSquare} alt="Matt Helm" class="hero-photo" />
		</div>
	</div>

	<div class="hero-scroll-hint" aria-hidden="true">
		<span class="mono-label">scroll</span>
		<div class="scroll-arrow">↓</div>
	</div>
</section>

<style>
	.section-hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 clamp(24px, 8vw, 144px);
		position: relative;
	}

	.hero-inner {
		display: flex;
		align-items: center;
		gap: clamp(34px, 5vw, 89px);
		width: 100%;
	}

	.hero-content {
		flex: 1;
		min-width: 0;
		max-width: 560px;
	}

	.hero-label {
		margin-bottom: 21px;
		letter-spacing: 0.12em;
	}

	.hero-name {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: clamp(3rem, 7vw, 6rem);
		font-weight: 500;
		line-height: 1.05;
		letter-spacing: -0.02em;
		color: #d4d0c8;
		margin: 0 0 21px;
	}

	.hero-tagline {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: clamp(1.2rem, 2.5vw, 1.8rem);
		font-weight: 400;
		font-style: italic;
		color: #8886c0;
		margin: 0 0 13px;
		line-height: 1.3;
	}

	/* ── Portrait ───────────────────────────────────────────────── */

	.hero-portrait {
		flex-shrink: 0;
		width: clamp(200px, 26vw, 360px);
		aspect-ratio: 1 / 1;
		-webkit-mask-image:
			linear-gradient(to right,  transparent, black 18%, black 82%, transparent),
			linear-gradient(to bottom, transparent, black 18%, black 82%, transparent);
		-webkit-mask-composite: source-in;
		mask-image:
			linear-gradient(to right,  transparent, black 18%, black 82%, transparent),
			linear-gradient(to bottom, transparent, black 18%, black 82%, transparent);
		mask-composite: intersect;
	}

	.hero-photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(35%) brightness(0.78) contrast(1.05);
		transition: filter 0.6s ease;
	}

	.hero-portrait:hover .hero-photo {
		filter: grayscale(0%) brightness(0.88) contrast(1.02);
	}

	/* ── Scroll hint ────────────────────────────────────────────── */

	.hero-scroll-hint {
		position: absolute;
		bottom: 34px;
		left: clamp(24px, 8vw, 144px);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.hero-scroll-hint :global(.mono-label) {
		color: #b0aec8;
	}

	.scroll-arrow {
		font-size: 16px;
		color: #b0aec8;
		animation: bob 2s ease-in-out infinite;
	}

	@keyframes bob {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(6px); }
	}

	@media (max-width: 900px) {
		.hero-portrait {
			display: none;
		}
	}

	@media (max-width: 600px) {
		.section-hero {
			padding: 0 20px;
		}
		.hero-scroll-hint {
			left: 20px;
		}
		.hero-label {
			font-size: 9px;
		}
	}
</style>
