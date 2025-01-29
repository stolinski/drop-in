<script lang="ts">
	import { nanoid } from 'nanoid';
	import { get_z_options } from '$lib/z.svelte';
	import { goto } from '$app/navigation';
	import { clear_jwt, pass } from '@drop-in/pass/client';
	import { Query, getZ } from 'zero-svelte';

	const z = getZ();

	const user = new Query(
		z.current.query.user
			.where('id', '=', z.current.userID)
			.related('profile', (profile) => profile.one())
			.one()
	);

	async function onclick() {
		await pass.logout().catch((e) => {
			console.log('logout error', e);
		});

		clear_jwt();
		z.close();
		z.build(get_z_options());
		goto('/');
	}

	function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = e.target as HTMLInputElement;
		const input_id = input.id;
		if (!input) return;
		if (user?.current?.profile) {
			z.current.mutate.profile.update({ id: user.current.profile.id, [input_id]: input.value });
		} else {
			z.current.mutate.profile.insert({
				id: nanoid(),
				user_id: user?.current?.id,
				[input_id]: input.value
			});
		}
	}
</script>

<h2>Profile</h2>

{#if user?.current?.id}
	<p>
		Email: {user.current.email}
	</p>

	<form>
		<div class="row">
			<label for="name">Name</label>
			<input type="text" name="name" id="name" {oninput} value={user.current.profile?.name} />
		</div>
	</form>

	<hr />

	<h3>Logout</h3>

	<button {onclick}>Logout</button>
{/if}
