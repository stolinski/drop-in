<script lang="ts">
	import Header from '$routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	import { current_user } from '$lib/queries';
	import { Query } from 'zero-svelte';
	// import { auth_guard } from '$utils/auth_guard';
	// import Verify from '$/lib/auth/Verify.svelte';
	let { children } = $props();
	const user = new Query(current_user);

	// $effect.pre(() => {
	// 	auth_guard();
	// });
</script>

hi
<!-- App and Site both use the Header and Footer, but you can make separate ones if you want -->

<!-- TODO verify -->
<!-- {#if data.user && !data.user.verified}
	<Verify user={data.user} />
{/if} -->

<Header {user} />

<main class="layout">
	<div class="content">
		{@render children()}
	</div>
</main>

<Footer />
