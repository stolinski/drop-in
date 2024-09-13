<script lang="ts">
	import Header from '$/routes/(app)/Header.svelte';
	import Footer from '$routes/(app)/Footer.svelte';

	let { children } = $props()

</script>

<Header /> 

<main class="layout">
	<div class="content">
		{@render children()}
	</div>
</main>

<Footer />
