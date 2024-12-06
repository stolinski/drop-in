<script lang="ts">
	import { Menu } from '@drop-in/decks';
	import { get_cache, get_z_options } from '$lib/z.svelte';
	import { Query } from '$lib/query.svelte';
	import { clear_jwt, pass } from '@drop-in/pass/client';
	import { goto } from '$app/navigation';
	import { Zero } from '@rocicorp/zero';

	const cache = get_cache();
	const user = new Query(
		cache.z.query.user
			.where('id', '=', cache.z?.userID)
			.related('profile', (profile) => profile.one())
			.one()
	);
</script>

<Menu name="user-menu" horizontal="RIGHT">
	{#snippet button()}
		{#if user?.data?.profile?.avatar}
			<img src={user?.data?.profile?.avatar} alt="avatar" />
		{:else}
			<span>{user?.data?.email?.[0]}</span>
		{/if}
	{/snippet}
	<div>
		<a href="/profile">Profile</a>
		<hr />
		<button
			onclick={async () => {
				await pass.logout().catch((e) => {
					console.log('logout error', e);
				});

				clear_jwt();
				cache.z.close();
				cache.z = new Zero(get_z_options());
				goto('/');
			}}>Logout</button
		>
	</div>
</Menu>

<style>
	:global(.di-menu-container .di-menu-button) {
		--size: 40px;
		border-radius: var(--size);
		padding: 0;
		width: var(--size);
		height: var(--size);
		font-size: var(--fs-s);
	}

	:global(.di-menu-container hr) {
		margin: var(--vs-m) 0 var(--vs-s);
		opacity: 0.2;
	}
</style>
