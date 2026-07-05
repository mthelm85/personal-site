<script lang="ts">
</script>

<section id="contact" class="section" aria-labelledby="contact-heading">
	<div class="section-inner">
		<h2 id="contact-heading" class="section-heading">Contact</h2>

		<p class="contact-intro">
			If something here piques your interest, let's get in touch!
		</p>

		<div class="contact-links">
			<a href="mailto:mthelm85@gmail.com" class="contact-link">
				<span class="contact-link-label mono-label">Email</span>
				<span class="contact-link-value">mthelm85@gmail.com</span>
			</a>

			<a
				href="https://github.com/mthelm85"
				target="_blank"
				rel="noopener noreferrer"
				class="contact-link"
			>
				<span class="contact-link-label mono-label">GitHub</span>
				<span class="contact-link-value">github.com/mthelm85</span>
			</a>
		</div>

		<footer class="site-footer">
			<div class="footer-line">
				<span class="mono-label">matthelm.pro</span>
			</div>
		</footer>
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
		max-width: 560px;
		width: 100%;
	}

	.contact-intro {
		font-family: 'MattHelm', Georgia, serif;
		font-size: 1.5rem;
		color: var(--color-text-secondary);
		line-height: 1.75;
		margin: 34px 0 55px;
	}

	.contact-links {
		display: flex;
		flex-direction: column;
		gap: 21px;
		margin-bottom: 55px;
	}

	.contact-link {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-decoration: none;
		transition: transform 0.2s;
	}

	.contact-link:hover {
		transform: translateX(4px);
	}

	.contact-link-label {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.contact-link-value {
		font-family: 'MattHelm', Georgia, serif;
		font-size: 1.3rem;
		color: var(--color-accent);
		transition: color 0.2s;
	}

	.contact-link:hover .contact-link-value {
		color: var(--color-accent-hi);
	}

	.site-footer {
		border-top: 1px solid var(--color-border);
		padding-top: 21px;
	}

	.footer-line {
		display: flex;
		align-items: center;
		gap: 13px;
	}

	@media (max-width: 600px) {
		.section {
			padding: 55px 20px;
		}
		.contact-intro {
			margin: 21px 0 34px;
		}
		.contact-links {
			margin-bottom: 34px;
		}
		.contact-link-value {
			font-size: 1.1rem;
			word-break: break-all;
		}
	}
</style>
