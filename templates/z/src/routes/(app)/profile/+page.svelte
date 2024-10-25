<script lang="ts">
	import { goto } from '$app/navigation';
	import { get_db } from '$lib/z';
	import { Query } from '$lib/query.svelte';
	import { nanoid } from 'nanoid';

	const z = get_db();

	const user = new Query(
		z.query.user
			.where('id', '=', z.userID)
			.related('profile', (profile) => profile.one())
			.one(),
	);
	$inspect(user.data);
	// $effect.pre(auth_guard);

	function onclick() {
		// LOGOUT
		goto('/');
	}

	function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = e.target as HTMLInputElement;
		const input_id = input.id;
		if (!input) return;
		if (user.data?.profile) {
			z.mutate.profile.update({ id: user.data.profile.id, [input_id]: input.value });
		} else {
			z.mutate.profile.create({ id: nanoid(), user_id: user.data.id, [input_id]: input.value });
		}
	}
</script>

<h2>Profile</h2>

<p>
	Email: {user.data?.email}
</p>

<form>
	<div class="row">
		<label for="name">Name</label>
		<input type="text" name="name" id="name" {oninput} value={user.data?.profile?.name} />
	</div>
</form>

<button {onclick}>Logout</button>
