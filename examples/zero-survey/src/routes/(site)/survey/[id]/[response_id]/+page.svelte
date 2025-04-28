<script lang="ts">
	import { page } from '$app/stores';
	import { Query } from 'zero-svelte';
	import { getZ } from 'zero-svelte';
	import Answer from './Answer.svelte';

	const z = getZ();
	const survey = new Query(
		z.current.query.surveys
			.where('id', '=', $page.params.id)
			.one()
			.related('questions', (q) => q.related('answers', (a) => a.one()))
			.related('responses', (r) => r.one())
	);
</script>

<h1>{survey.current?.title}</h1>

<div class="readable">
	{#each survey.current?.questions || [] as question, index}
		<Answer {question} {index} />
	{/each}
</div>

<button class="button">Submit</button>
