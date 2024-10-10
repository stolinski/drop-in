<script lang="ts">
	import { settings } from '$settings';
</script>

<header class="layout">
	<div class="flex">
		<p><a href="/">{settings.app_name}</a></p>
		<nav>
			<!-- Add your nav -->
		</nav>
	</div>
</header>

<style>
	header {
		padding: var(--vs-m) 0;
		p a {
			text-decoration: none;
			color: var(--fg);
			font-weight: bold;
		}
	}
</style>
