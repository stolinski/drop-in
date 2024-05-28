<script lang="ts">
	import Categories from '$lib/Categories.svelte';
	import PostListing from '$lib/PostListing.svelte';
	import Tags from '$lib/Tags.svelte';
	import { settings } from '$settings';

	const { data } = $props();
</script>

<!-- Wand a left sidebar, used layout-sidebar -->
<div class="layout-sidebar-inverse full" style:--max-width="1100px" style:--side-bar-width="200px">
	<section class="content">
		<!-- This is visually hidden because we want an h1 but it's doesn't make sense in the design -->
		<!-- This is a good tech for A11y but remove the class if you want it to be visible -->
		<h1 class="visually-hidden">{settings.app_name}</h1>

		{#each data.posts as post}
			<PostListing {post} />
		{/each}
	</section>

	<aside class="sidebar">
		<Categories categories={data.categories} />
		<Tags tags={data.tags} />
	</aside>
</div>
