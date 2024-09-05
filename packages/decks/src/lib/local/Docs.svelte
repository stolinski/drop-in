<script lang="ts">
	import Accordion from '$lib/Accordion.svelte';
	import AreYouSure from '$lib/AreYouSure.svelte';
	import Menu from '$lib/Menu.svelte';
	import Share from '$lib/Share.svelte';
</script>

<h1>@drop-in/decks 🛹</h1>

<p>
	Decks is a ui component library that doesn't depend on dependencies or css frameworks to function.
	They are also deeply committed to using browser standards and APIs before custom JavaScript. Add
	your own theme, or use `@drop-in/graffiti` to style your decks.
</p>

<p>
	Disclaimer: These are under active development. I encourage you to try them and submit pr's to
	improve them. I'd like to keep them as opinionated, drop-in style elements, rather than a deep
	customizable framework.
</p>

<h2>Share</h2>
<Share
	url="https://svelte.dev"
	title="Svelte"
	text="Check out Svelte"
	twitter_account="sveltejs"
	after_copy={() => {}}
/>

<h2>Accordion</h2>
<Accordion summary="What is up with this?">
	<h3>It ain't nothing really</h3>
	<p>ayo Dun, spark the Philly</p>
</Accordion>

<h2>Are you sure? - Confirmation Button</h2>

<AreYouSure onclick={() => alert('Doing whatever')} />

<h2>Menu</h2>

<Menu name="menu">
	{#snippet button()}
		Menu
	{/snippet}
	<button>Click me</button>
</Menu>
