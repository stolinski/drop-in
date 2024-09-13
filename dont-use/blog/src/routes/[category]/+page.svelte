<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Categories from '$lib/Categories.svelte';
	import PostListing from '$lib/PostListing.svelte';

	const { data } = $props();
</script>

<div class="layout-sidebar-inverse full" style:--max-width="1000px" style:--side-bar-width="200px">
	<section class="content">
		<h1>{data.category}</h1>
		<div class="category-description">
			<svelte:component this={data.content} />
		</div>
		{#if data.posts.length > 0}
			{#each data.posts as post}
				<PostListing {post} />
			{/each}
		{:else}
			<p>No posts in this category yet.</p>
		{/if}
	</section>

	<aside class="sidebar">
		<Categories categories={data.categories} />
		<Tags tags={data.tags} />
	</aside>
</div>
