<script lang="ts">
	import "@drop-in/theme"
	import { SideNav } from '@drop-in/documents';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	let { children } = $props()
 
</script>

<Header />

<div class="layout-sidebar">
	<aside class="sidebar">
		<SideNav />
	</aside>
	<section class="content">
		{@render children()}
	</section>
</div>

<Footer />