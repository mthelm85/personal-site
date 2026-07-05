<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Theorem: The page you requested exists. — matthelm.pro</title>
</svelte:head>

<div class="error-page">
	<a href="/" class="back-link mono-label">← matthelm.pro</a>

	<article class="proof">
		<header>
			<div class="error-code mono-label">{page.status ?? '404'}</div>
			<h1>Theorem</h1>
			<p class="theorem-statement">
				<em>The page you requested exists.</em>
			</p>
		</header>

		<div class="proof-body">
			<div class="proof-step">
				<span class="step-label">Proof.</span> Assume for contradiction that this page does not exist.
			</div>

			<div class="proof-step">
				Then you could not have navigated to it.
			</div>

			<div class="proof-step">
				But you <em>did</em> navigate to it — you are reading this.
			</div>

			<div class="proof-step contradiction">
				Contradiction. &ensp; ∎
			</div>

			<div class="proof-resolution">
				<p>
					Therefore the page exists. You simply cannot see it.
				</p>
				<p class="corollary">
					<em>Corollary:</em> Existence and observability are not equivalent. A fact well worth keeping in mind.
				</p>
			</div>

			<div class="nav-links">
				<div class="mono-label" style="margin-bottom: 13px; color: var(--color-text-secondary);">While you're here:</div>
				<div class="links">
					<a href="/">Home</a>
					<span aria-hidden="true">·</span>
					<a href="/#projects">Projects</a>
					<span aria-hidden="true">·</span>
					<a href="/#contact">Contact</a>
	
				</div>
			</div>
		</div>
	</article>
</div>

<style>
	.error-page {
		min-height: 100vh;
		padding: 89px clamp(24px, 8vw, 144px);
		max-width: 680px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 10;
	}

	.back-link {
		display: inline-block;
		color: var(--color-text-secondary);
		text-decoration: none;
		margin-bottom: 55px;
		transition: color 0.2s;
		font-size: 12px;
	}

	.back-link:hover {
		color: var(--color-text-secondary);
	}

	.error-code {
		font-size: 13px;
		color: var(--color-text-secondary);
		margin-bottom: 13px;
		letter-spacing: 0.12em;
	}

	h1 {
		font-family: 'MattHelm', Georgia, serif;
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 500;
		color: var(--color-text-primary);
		margin: 0 0 13px;
	}

	.theorem-statement {
		font-family: 'MattHelm', Georgia, serif;
		font-size: 1.55rem;
		color: var(--color-text-secondary);
		margin: 0 0 55px;
		font-style: italic;
	}

	.proof-body {
		font-family: 'MattHelm', Georgia, serif;
		font-size: 1.45rem;
		line-height: 1.8;
	}

	.proof-step {
		color: var(--color-text-secondary);
		margin-bottom: 13px;
		padding-left: 8px;
		font-size: 1.3rem;
	}

	.step-label {
		color: var(--color-accent-hi);
		font-style: italic;
	}

	.proof-step em {
		color: var(--color-text-primary);
		font-style: normal;
		font-weight: 500;
	}

	.contradiction {
		color: var(--color-accent-hi);
		font-size: 1.3rem;
		margin: 21px 0 34px;
		padding-left: 8px;
		border-left: 2px solid var(--color-border);
	}

	.proof-resolution {
		border-top: 1px solid var(--color-border);
		padding-top: 21px;
		margin: 34px 0 55px;
	}

	.proof-resolution p {
		color: var(--color-text-secondary);
		margin: 0 0 13px;
	}

	.corollary {
		font-size: 0.95rem;
		color: var(--color-text-secondary) !important;
	}

	.nav-links {
		margin-top: 55px;
	}

	.links {
		display: flex;
		gap: 13px;
		align-items: center;
		font-family: 'MattHelm', Georgia, serif;
		font-size: 13px;
		color: var(--color-text-secondary);
	}

	.links a {
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color 0.2s;
	}

	.links a:hover {
		color: var(--color-accent);
	}
</style>
