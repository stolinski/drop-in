<script lang="ts">
	const {
		tags,
	}: {
		tags: [string, number][];
	} = $props();
</script>

<section class="tags">
	<h3>Tags</h3>
	<ul class="no-list">
		{#each tags as [tag, count]}
			<li>
				<a href="/tags/{tag}">#{tag} <span>{count}</span></a>
			</li>
		{/each}
	</ul>
</section>

<style>
	a {
		color: var(--fg);
		text-decoration: none;
	}
</style>
