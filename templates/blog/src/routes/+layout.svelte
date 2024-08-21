<script lang="ts">
	import './app.css';
	import "@drop-in/graffiti";
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import { onNavigate } from '$app/navigation'
	let { children } = $props()
 

	onNavigate((navigation) => {
		if (!document.startViewTransition) return

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
		})
	})

</script>

<Header />

<main>
<div class="layout">
	{@render children()}
</div>
</main>


<Footer />