<script lang="ts">
	import Header from '$routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	import { PUBLIC_SERVER } from '$env/static/public';

	let { children } = $props();
</script>

<!-- Delete me once you set your  URL var -->
{#if !PUBLIC_SERVER}
	<p style="text-align: center; background: lightpink; margin: 0; padding: 10px;">
		!IMPORTANT: You need to set the PUBLIC_SERVER environment variable in "/.env". This is the URL
		to your data server
	</p>
{/if}
<!-- /Delete me -->

<Header />

<main class="layout">
	{@render children()}
</main>

<Footer />
