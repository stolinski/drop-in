<script lang="ts">
	import UserMenu from '$lib/components/UserMenu.svelte';

	let { user } = $props();
</script>

<header class="layout">
	<div class="flex">
		<p><a href="/">{DROP_IN.app.name}</a></p>
		<nav>
			<!-- Add your nav -->
		</nav>
		{#if user?.id}
			<UserMenu />
		{/if}
	</div>
</header>

<style>
	header {
		padding: var(--vs-m) 0;
		p {
			margin: 0;
			a {
				text-decoration: none;
				color: var(--fg);
				font-weight: bold;
			}
		}
		.flex {
			align-items: center;
			justify-content: space-between;
		}
	}
</style>
