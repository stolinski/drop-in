<script lang="ts">
	import { page } from '$app/stores';
	import { get_cache } from '$lib/z.svelte';
	import { nanoid } from 'nanoid';
	import EditRow from './EditRow.svelte';
	import { Query } from '$lib/query.svelte';

	const cache = get_cache();

	const survey = new Query(
		cache.z.query.surveys
			.where('id', '=', $page.params.id)
			.one()
			.related('questions', (q) => q)
	);

	function onclick() {
		cache.z.mutate.questions.insert({
			id: nanoid(),
			survey_id: $page.params.id,
			question_text: 'New Question',
			question_type: 'text',
			order_num: survey?.data?.questions?.length || 0 + 1
		});
	}
</script>

<h2>Edit Survey</h2>

{#each survey?.data?.questions as question, index}
	<EditRow {question} {index} />
{/each}
<hr />

<button {onclick}>Add Question</button>
