<script lang="ts">
	import Header from '$routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	import { app_guard } from '$/utils/app_guard';
	import { PUBLIC_PB_URL } from '$env/static/public';
	let { children } = $props()
 
	// Everything in the app route tree is protected behind user accounts.
	$effect.pre(app_guard);
</script>

<!-- Delete me once you set your Pocketbase URL var -->
{#if !PUBLIC_PB_URL}
	<p style="text-align: center; background: lightpink; margin: 0; padding: 10px;">!IMPORTANT: You need to set the PUBLIC_PB_URL environment variable in "/.env" for authentication to work.</p>
{/if}
<!-- /Delete me -->

<Header />

<main class="layout">
	{@render children()}
</main>

<Footer />