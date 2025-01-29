<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { Query } from 'zero-svelte';
	import { cache } from '$lib/z.svelte';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
	const z = $derived(cache.z);

	const user = new Query(
		z?.query.user
			.where('id', '=', z?.userID)
			.related('profile', (profile) => profile.one())
			.one()
	);
	$effect(() => {
		console.log('USER CHANGED:', $state.snapshot(user.data));
		auth.set_user($state.snapshot(user.data) || {});
	});
</script>

{@render children()}
