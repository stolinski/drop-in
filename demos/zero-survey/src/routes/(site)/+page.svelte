<script lang="ts">
	import { app_guard } from '$utils/app_guard';
	$effect.pre(app_guard);
</script>

<h1>{DROP_IN.app.name}</h1>

<a href="/auth/signup">Sign Up</a>
