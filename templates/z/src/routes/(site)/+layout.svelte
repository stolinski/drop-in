<script lang="ts">
	import '@drop-in/graffiti';
	import Footer from '$routes/(app)/Footer.svelte';
	import { app_guard } from '$utils/app_guard';

	let { children } = $props();

	// Everything in the site route tree will be reidrected to the app route tree when logged in.
	$effect.pre(app_guard);
</script>

<main class="layout">
	{@render children()}
</main>

<Footer />
