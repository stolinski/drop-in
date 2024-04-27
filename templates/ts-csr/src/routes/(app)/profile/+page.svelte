<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$/pocketbase';
	import { auth_guard } from '$/utils/auth_guard';

	$effect.pre(auth_guard);

	function onclick() {
		pb.authStore.clear();
		goto('/');
	}
</script>

<h2>{pb.authStore.model?.name}</h2>

<p>
	Email: {pb.authStore.model?.email}
</p>

<button {onclick}>Logout</button>
