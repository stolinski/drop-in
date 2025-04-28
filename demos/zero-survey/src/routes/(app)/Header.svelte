<script lang="ts">
	import UserMenu from '$lib/components/UserMenu.svelte';
</script>

<header class="layout">
	<div class="flex">
		<p><a href="/">{DROP_IN.app.name}</a></p>
		<nav>
			<!-- Add your nav -->
		</nav>

		<UserMenu />
	</div>
</header>

<style>
	header {
		padding: var(--vs-m) 0;
		p {
			margin: 0;
			a {
				text-decoration: none;
				color: var(--c-fg);
				font-weight: bold;
			}
		}
		.flex {
			align-items: center;
			justify-content: space-between;
		}
	}
</style>
