<script lang="ts">
	import { Menu } from '@drop-in/decks';
	import { get_z_options } from '$lib/z.svelte';
	import { Query, getZ } from 'zero-svelte';
	import { clear_jwt, pass } from '@drop-in/pass/client';
	import { goto } from '$app/navigation';

	const z = getZ();

	const user = new Query(
		z.current.query.user
			.where('id', '=', z.current.userID)
			.related('profile', (profile) => profile.one())
			.one()
	);
</script>

{#if z.current.userID !== 'anon'}
	<Menu name="user-menu" horizontal="RIGHT">
		{#snippet button()}
			{#if user?.current?.profile?.avatar}
				<img src={user?.current?.profile?.avatar} alt="avatar" />
			{:else}
				<span>{user?.current?.email?.[0]}</span>
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
					z.close();
					z.build(get_z_options());
					goto('/');
				}}>Logout</button
			>
		</div>
	</Menu>
{/if}

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
