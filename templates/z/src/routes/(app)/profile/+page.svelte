<script lang="ts">
	import { nanoid } from 'nanoid';
	import { get_z_options, z } from '$lib/z.svelte';
	import { clear_jwt, pass } from '@drop-in/pass/client';
	import { goto } from '$app/navigation';

	let { user } = $props();

	async function onclick() {
		// LOGOUT
		await pass.logout().catch((e) => {
			console.log('logout error', e);
		});
		clear_jwt();
		z.close();
		z.build(get_z_options());
		goto('/landing');
	}

	function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = e.target as HTMLInputElement;
		const input_id = input.id;
		if (!input) return;
		if (user?.current.profile) {
			z.current.mutate.profile.update({ id: user.current.profile.id, [input_id]: input.value });
		} else {
			z.current.mutate.profile.insert({
				id: nanoid(),
				user_id: user.current.id,
				[input_id]: input.value
			});
		}
	}
</script>

<h2>Profile</h2>

<p>
	Email: {user.email}
</p>

<form>
	<div class="row">
		<label for="name">Name</label>
		<input type="text" name="name" id="name" {oninput} value={user.profile?.name} />
	</div>
</form>

<hr />

<h3>Logout</h3>

<button {onclick}>Logout</button>
