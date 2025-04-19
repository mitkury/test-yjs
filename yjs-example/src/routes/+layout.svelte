<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	
	let { children } = $props();
</script>

<div class="app">
	<nav>
		<div class="nav-container">
			<div class="logo">Yjs Examples</div>
			<ul class="nav-links">
				<li class:active={$page.url.pathname === '/'}>
					<a href="/">Rich Text Editor</a>
				</li>
				<li class:active={$page.url.pathname === '/plain-text'}>
					<a href="/plain-text">Plain Text Editor</a>
				</li>
			</ul>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	nav {
		background-color: #1e293b;
		color: white;
		padding: 0.5rem 0;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-weight: bold;
		font-size: 1.25rem;
	}

	.nav-links {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 1.5rem;
	}

	.nav-links li {
		position: relative;
	}

	.nav-links li.active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.5rem;
		height: 2px;
		background-color: #3b82f6;
	}

	.nav-links a {
		color: white;
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.nav-links a:hover {
		opacity: 0.8;
	}

	main {
		flex: 1;
	}

	@media (max-width: 640px) {
		.nav-container {
			flex-direction: column;
			gap: 0.5rem;
			padding: 0.5rem 1rem;
		}
	}
</style>
