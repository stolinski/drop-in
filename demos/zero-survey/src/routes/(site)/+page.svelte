<script lang="ts">
	import { app_guard } from '$utils/app_guard';
	import settings from 'virtual:dropin-config';
	$effect.pre(app_guard);
</script>

<h1>{settings.app_name}</h1>

<a href="/auth/signup">Sign Up</a>
