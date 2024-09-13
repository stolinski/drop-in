<script lang="ts">
	import '@drop-in/graffiti';
	import Accordion from '$lib/Accordion.svelte';
	import AreYouSure from '$lib/AreYouSure.svelte';
	import Menu from '$lib/Menu.svelte';
	import Share from '$lib/Share.svelte';
	import { Toast, toaster } from '$lib/toast/index';
</script>

<div class="fc">
	<div class="layout">
		<h1>@drop-in/decks 🛹</h1>
		<div class="sub">
			<div class="content fc">
				<p>
					Decks is a ui component library that doesn't depend on dependencies or css frameworks to
					function. They are also deeply committed to using browser standards and APIs before custom
					JavaScript. Add your own theme, or use `@drop-in/graffiti` to style your decks.
				</p>
			</div>
			<div class="content fc">
				<p>
					Disclaimer: These are under active development. I encourage you to try them and submit
					pr's to improve them. I'd like to keep them as opinionated, drop-in style elements, rather
					than a deep customizable framework.
				</p>

				<div class="row">
					<h2 class="fs-l">Share</h2>
					<Share
						url="https://svelte.dev"
						title="Svelte"
						text="Check out Svelte"
						twitter_account="sveltejs"
						after_copy={() => {}}
					/>
				</div>

				<div class="row">
					<h2 class="fs-l">Accordion</h2>
					<Accordion summary="What is up with this?">
						<h3>It ain't nothing really</h3>
						<p>ayo Dun, spark the Philly</p>
					</Accordion>
				</div>

				<div class="row">
					<h2 class="fs-l">Are you sure? - Confirmation Button</h2>
					<AreYouSure onclick={() => alert('Doing whatever')} />
				</div>

				<div class="row">
					<h2 class="fs-l">Menu</h2>
					<Menu name="menu">
						{#snippet button()}
							Menu
						{/snippet}
						<button>Click me</button>
					</Menu>
				</div>

				<div class="row">
					<h2 class="fs-l">Toast</h2>

					<button onclick={() => toaster.send('Hi from toast')}>Click me</button>
					<button
						onclick={() => toaster.send('Hi from toast', { type: 'SUCCESS', duration: 5000000 })}
						>Success</button
					>
					<button onclick={() => toaster.send('Hi from toast', { type: 'ERROR' })}>Error</button>
					<button onclick={() => toaster.send('Hi from toast', { type: 'WARNING' })}>Warning</button
					>
				</div>
			</div>
		</div>
	</div>
</div>

<Toast position={{ inline: 'end', block: 'end' }} offset={{ inline: '20px', block: '20px' }} />
