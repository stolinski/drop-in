<script lang="ts">
	import Categories from '$/lib/Categories.svelte';

	const { data } = $props();
</script>

<div class="layout-sidebar-inverse full" style:--max-width="1000px" style:--side-bar-width="200px">
	<section class="content">
		<h1 style:--transition-name="post-title-{data.meta.slug}">{data.meta.title}</h1>
		<div class="post-tags">
			{#each data.meta.tags as tag}
				<a href="/tags/{tag}">#{tag}</a>
			{/each}
		</div>
		<svelte:component this={data.content} />
	</section>
	<aside class="sidebar">
		<!-- <Categories categories={data.categories} />
		<Tags tags={data.tags} /> -->
	</aside>
</div>

<style>
	.post-tags a {
		color: var(--fg);
		text-decoration: none;
		padding: 4px;
	}
</style>
