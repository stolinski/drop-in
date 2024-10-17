<script lang="ts">
	import { create_zero } from '$/lib/z';
	import Header from '$/routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	// import Verify from '$/lib/auth/Verify.svelte';
	let { children } = $props()
	
	const auth = get_login()
	create_zero({
		user_id: auth.user_id,
		jwt: auth.jwt,
	});


	// TODO Auth Gaurd?
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
