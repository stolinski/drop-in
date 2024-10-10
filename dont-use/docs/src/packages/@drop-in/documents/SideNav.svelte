<script lang="ts">
	let { routes }: { routes: { name: string; link: string }[] } = $props();
</script>

<nav>
	<ol>
		{#each routes as route}
			<li><a href={route.link}>{route.name}</a></li>
		{/each}
	</ol>

	<ul>
		<li>Packages</li>
		<li><a href="/graffiti">@drop-in/graffiti</a></li>
		<li><a href="/decks">@drop-in/decks</a></li>
	</ul>
</nav>

<style>
	nav {
		margin-block: 1rem;
	}
	ol {
		margin: 0;
		padding-left: 20px;
		margin-bottom: 2rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin: 0;
		padding: 0;
		font-size: var(--fs-xs);
	}

	a {
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
