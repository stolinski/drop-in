<script lang="ts">
	import '$lib/style.css';
	import Header from '$routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	import { app_guard } from '$/utils/app_guard';
	import { PUBLIC_PB_URL } from '$env/static/public';
	let { children } = $props()

	// Everything in the app route tree is protected behind user accounts.
	$effect.pre(app_guard);
</script>



{#if !PUBLIC_PB_URL}
<p>!IMPORTANT: You need to set the PUBLIC_PB_URL environment variable</p>
{/if}

<Header />

<main>
	{@render children()}
</main>

<Footer />
