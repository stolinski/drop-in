<script lang="ts">
	let { routes }: { routes: { name: string; link: string }[] } = $props();
</script>

<nav>
	<ul>
		{#each routes as route}
			<li><a href={route.link}>{route.name}</a></li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin: 0;
		padding: 0;
	}

	a {
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
