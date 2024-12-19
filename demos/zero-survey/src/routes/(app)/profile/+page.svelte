<script lang="ts">
	import { nanoid } from 'nanoid';
	import { get_cache, get_z_options } from '$lib/z.svelte';
	import { goto } from '$app/navigation';
	import { clear_jwt, pass } from '@drop-in/pass/client';
	import { Query } from '$lib/query.svelte';
	import { Zero } from '@rocicorp/zero';

	const cache = get_cache();

	const user = new Query(
		cache.z.query.user
			.where('id', '=', cache.z.userID)
			.related('profile', (profile) => profile.one())
			.one()
	);

	async function onclick() {
		await pass.logout().catch((e) => {
			console.log('logout error', e);
		});

		clear_jwt();
		cache.z.close();
		cache.z = new Zero(get_z_options());
		goto('/');
	}

	function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = e.target as HTMLInputElement;
		const input_id = input.id;
		if (!input) return;
		if (user?.data?.profile) {
			cache.z.mutate.profile.update({ id: user.data.profile.id, [input_id]: input.value });
		} else {
			cache.z.mutate.profile.insert({
				id: nanoid(),
				user_id: user.data.id,
				[input_id]: input.value
			});
		}
	}
</script>

<h2>Profile</h2>

{#if user?.data?.id}
	<p>
		Email: {user.data.email}
	</p>

	<form>
		<div class="row">
			<label for="name">Name</label>
			<input type="text" name="name" id="name" {oninput} value={user.data.profile?.name} />
		</div>
	</form>

	<hr />

	<h3>Logout</h3>

	<button {onclick}>Logout</button>
{/if}
