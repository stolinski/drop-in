<script lang="ts">
	import settings from 'virtual:dropin-config';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import { auth } from '$lib/auth.svelte';
</script>

<header class="layout">
	<div class="flex">
		<p><a href="/">{settings.app.name}</a></p>
		<nav>
			<!-- Add your nav -->
		</nav>
		{#if auth.user?.id}
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
