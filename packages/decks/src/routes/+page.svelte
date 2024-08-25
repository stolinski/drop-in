<script lang="ts">
	import Share from '$lib/Share.svelte';
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Share
	url="https://svelte.dev"
	title="Svelte"
	text="Check out Svelte"
	twitter_account="sveltejs"
	after_copy={() => {}}
/>
