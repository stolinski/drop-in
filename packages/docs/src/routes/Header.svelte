<script lang="ts">
	import { settings } from '$settings';
</script>

<header class="layout">
	<div>
		<p><a href="/">{settings.app_name}</a></p>
	</div>
</header>

<style>
	header {
		border-bottom: 1px solid rgb(255 255 255 / 0.1);
	}
	header a {
		color: var(--fg);
		text-decoration: none;
	}
</style>
