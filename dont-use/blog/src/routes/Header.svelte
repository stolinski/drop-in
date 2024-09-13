<script lang="ts">
	import { settings } from '$settings';
</script>

<header class="layout">
	<div class="content">
		<p><a href="/">{settings.app_name}</a></p>
		<nav>
			<!-- Add your nav -->
			<ul>
				<li><a href="/about">About</a></li>
				<li><a href="/">Blog</a></li>
				<li><a href="/rss.xml">Feed</a></li>
			</ul>
		</nav>
	</div>
</header>

<style>
	.content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	header {
		border-bottom: 1px solid rgb(255 255 255 / 0.1);
	}
	header a {
		color: var(--fg);
		text-decoration: none;
	}
	nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 10px;
	}
	li {
	}
</style>
