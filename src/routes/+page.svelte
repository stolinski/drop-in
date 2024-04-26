<script lang="ts">
	import { auth_guard } from '$/utils/auth_guard';
	$effect.pre(auth_guard);
</script>

<h1>SvelteKit Pocketbase Starter Kit</h1>

<h2>You've made it to the logged in homepage, nice work.</h2>
