<script lang="ts">
	import { Menu } from '@drop-in/decks';
	import { pass } from '@drop-in/pass/client';
	import type { User } from '@drop-in/pass/schema';
	let {
		user
	}: {
		user: User;
	} = $props();
</script>

<Menu name="user-menu" horizontal="RIGHT">
	{#snippet button()}
		{#if user?.current.profile?.avatar}
			<img src={user?.current.profile?.avatar} alt="avatar" />
		{:else}
			<span>{user?.current.email?.[0]}</span>
		{/if}
	{/snippet}
	<div>
		<a href="/profile">Profile</a>
		<hr />
		<button onclick={() => pass.logout()}>Logout</button>
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
