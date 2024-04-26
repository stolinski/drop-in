<script lang="ts">
	import '$lib/style.css';
	import Header from '$routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	import { auth_guard } from '$/utils/auth_guard';
	// Everything in the app route tree is protected behind user accounts.
	$effect.pre(auth_guard);

	let { children } = $props()
</script>

<!-- App and Site both use the Header and Footer, but you can make separate ones if you want -->
<Header />

<main>
	{@render children()}
</main>

<Footer />
