<script lang="ts">
	import './app.css';
	import '@drop-in/graffiti/drop-in.css';


	import { SideNav } from '@drop-in/documents';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import { Toast } from '@drop-in/toast';
	import { onNavigate } from '$app/navigation'
	let { children, data} = $props()
	let { routes } = data
 

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

<div class="layout">
	<aside class="sidebar">
		<SideNav {routes} />
	</aside>
	<section class="main">
		{@render children()}
	</section>
</div>

<Toast position={{ inline: 'end', block: 'end' }} offset={{ inline: '20px', block: '20px' }} />

<Footer />