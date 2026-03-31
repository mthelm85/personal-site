<script lang="ts">
	import { TIMELINE } from '$lib/data/timeline';
</script>

<section id="experience" class="section" aria-labelledby="experience-heading">
	<div class="section-inner">
		<h2 id="experience-heading" class="section-heading">Experience</h2>

		<div class="timeline" role="list">
			{#each TIMELINE as entry, i}
				<div class="timeline-entry" role="listitem">
					<!-- Year marker -->
					<div class="timeline-year" aria-hidden="true">
						<span>{entry.year}</span>
						<div class="timeline-dot {entry.type === 'education' ? 'education' : 'work'}"></div>
					</div>

					<!-- Content -->
					<div class="timeline-content">
						<div class="timeline-meta">
							<span class="mono-label timeline-type"
								>{entry.type === 'education' ? 'Education' : 'Work'}</span
							>
						</div>
						<h3 class="timeline-title">{entry.title}</h3>
						<div class="timeline-org">{entry.organization}</div>
						<p class="timeline-desc">{entry.description}</p>
					</div>
				</div>
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
		max-width: 680px;
		width: 100%;
	}

	.timeline {
		margin-top: 55px;
		position: relative;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 80px;
		top: 0;
		bottom: 0;
		width: 1px;
		background: rgba(154, 152, 176, 0.35);
	}

	.timeline-entry {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: 21px;
		margin-bottom: 55px;
		position: relative;
		align-items: start;
	}

	.timeline-year {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		padding-top: 2px;
		gap: 8px;
		position: relative;
	}

	.timeline-year span {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #9a98b0;
		letter-spacing: 0.04em;
		padding-right: 14px; /* clear the dot */
	}

	.timeline-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		border: 1px solid;
		position: absolute;
		right: -4px; /* center the dot on the vertical line at the right edge */
		top: 8px; /* vertically center with the year text */
	}

	.timeline-dot.work {
		background: #1a1a2e;
		border-color: #6a68a0;
	}

	.timeline-dot.education {
		background: #1a1a2e;
		border-color: #b08860;
	}

	.timeline-meta {
		margin-bottom: 4px;
		line-height: 1;
	}

	.timeline-type {
		font-size: 10px;
	}

	.timeline-title {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: 1.2rem;
		font-weight: 500;
		color: #d4d0c8;
		margin: 4px 0 4px;
	}

	.timeline-org {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #9a98b0;
		margin-bottom: 10px;
		letter-spacing: 0.03em;
	}

	.timeline-desc {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: 0.95rem;
		color: #9a98b0;
		line-height: 1.6;
		margin: 0;
	}

	@media (max-width: 600px) {
		.section {
			padding: 55px 20px;
		}
		.timeline::before {
			display: none;
		}
		.timeline-entry {
			grid-template-columns: 1fr;
			gap: 8px;
			margin-bottom: 34px;
		}
		.timeline-year {
			flex-direction: row;
			align-items: center;
			gap: 8px;
		}
		.timeline-year span {
			padding-right: 0;
		}
		.timeline-dot {
			position: static;
		}
	}
</style>
