<script lang="ts">
	import settings from 'virtual:dropin-config';
</script>

<header class="layout">
	<div class="flex">
		<p><a href="/">{settings.app.name}</a></p>
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
