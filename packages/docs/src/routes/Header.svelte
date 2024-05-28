<script lang="ts">
	import { settings } from '$settings';
</script>

<header class="layout">
	<div>
		<p><a href="/">{settings.app_name}</a></p>
		<nav>
			<ul>
				<li><a href="/about">About</a></li>
			</ul>
		</nav>
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
