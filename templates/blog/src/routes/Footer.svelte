<script lang="ts">
	import { settings } from '$/settings';
</script>

<footer class="layout">
	<p>&copy; {new Date().getFullYear()} {settings.app_name}</p>
	<ul>
		<li><a href="/">Home</a></li>
	</ul>
</footer>

<style>
	footer {
		padding-block: 60px;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
</style>
