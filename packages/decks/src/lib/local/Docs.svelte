<script lang="ts">
	import '@drop-in/graffiti';
	import Accordion from '$lib/Accordion.svelte';
	import AreYouSure from '$lib/AreYouSure.svelte';
	import Menu from '$lib/Menu.svelte';
	import Share from '$lib/Share.svelte';
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
			</div>
		</div>
	</div>
</div>
