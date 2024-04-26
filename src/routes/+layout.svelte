<script lang="ts">
	import '$lib/style.css'
	import Header from '$routes/Header.svelte'
	import Footer from '$routes/Footer.svelte'
</script>

<Header />

<main>
	<slot />
</main>

<Footer />
