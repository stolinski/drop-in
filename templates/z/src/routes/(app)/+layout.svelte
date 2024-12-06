<script lang="ts">
	import { cache } from '$lib/z.svelte';
	import Header from '$routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	import { auth_guard } from '$utils/auth_guard';
	// import Verify from '$/lib/auth/Verify.svelte';
	let { children } = $props();
	const z = $derived(cache.z);

	$effect.pre(() => {
		auth_guard();
	});
</script>

<!-- App and Site both use the Header and Footer, but you can make separate ones if you want -->

<!-- TODO verify -->
<!-- {#if data.user && !data.user.verified}
	<Verify user={data.user} />
{/if} -->

<Header />

<main class="layout">
	<div class="content">
		{@render children()}
	</div>
</main>

<Footer />
