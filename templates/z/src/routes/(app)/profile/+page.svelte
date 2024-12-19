<script lang="ts">
	import { cache } from '$lib/z.svelte';
	import { nanoid } from 'nanoid';
	import { auth } from '$lib/auth.svelte';

	const z = $derived(cache.z);
	let user = $derived(auth.user);

	async function onclick() {
		// LOGOUT
		auth.logout();
	}

	function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = e.target as HTMLInputElement;
		const input_id = input.id;
		if (!input) return;
		if (user?.profile) {
			z.mutate.profile.update({ id: user.profile.id, [input_id]: input.value });
		} else {
			z.mutate.profile.create({ id: nanoid(), user_id: user.data.id, [input_id]: input.value });
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
