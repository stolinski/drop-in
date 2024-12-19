<script lang="ts">
	import { page } from '$app/stores';
	import { Query } from '$lib/query.svelte';
	import { get_cache } from '$lib/z.svelte';
	import Answer from './Answer.svelte';

	const cache = get_cache();
	const survey = new Query(
		cache.z.query.surveys
			.where('id', '=', $page.params.id)
			.one()
			.related('questions', (q) => q.related('answers', (a) => a.one()))
			.related('responses', (r) => r.one())
	);
</script>

<h1>{survey.data?.title}</h1>

<div class="readable">
	{#each survey.data?.questions || [] as question, index}
		<Answer {question} {index} />
	{/each}
</div>

<button class="button">Submit</button>
