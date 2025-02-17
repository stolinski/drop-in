<script lang="ts">
	import Header from '$/routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';
	import { auth_guard } from '$/utils/auth_guard';
	import Verify from '$/lib/auth/Verify.svelte';
	import { pb } from '$/pocketbase.js';
	import { invalidate } from '$app/navigation'

	// Everything in the app route tree is protected behind user accounts.
	$effect.pre(auth_guard);

	let { children, data } = $props()

	$effect(() => {
		return pb.collection('users').subscribe(pb.authStore.model.id, async () => {
			await pb.collection('users').authRefresh();
			invalidate('app:user');
		});
	});
</script>


<!-- App and Site both use the Header and Footer, but you can make separate ones if you want -->

{#if data.user && !data.user.verified}
	<Verify user={data.user} />
{/if}

<Header />

<main class="layout">
	<div class="content">
		{@render children()}
	</div>
</main>

<Footer />
