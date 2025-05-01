<script lang="ts">
	import { page } from '$app/stores';
	import { getZ } from 'zero-svelte';
	import { nanoid } from 'nanoid';
	import EditRow from './EditRow.svelte';
	import { Query } from 'zero-svelte';

	const z = getZ();

	const survey = new Query(
		z.current.query.surveys
			.where('id', '=', $page.params.id)
			.one()
			.related('questions', (q) => q)
	);

	$inspect(survey.current);

	function onclick() {
		z.current.mutate.questions.insert({
			id: nanoid(),
			survey_id: $page.params.id,
			question_text: 'New Question',
			question_type: 'text',
			description: '',
			order: survey?.current?.questions?.length || 0 + 1,
			config: {
				required: false
			}
		});
	}
</script>

<h2>Edit Survey</h2>
<div class="readable">
	{#each survey?.current?.questions as question, index}
		<EditRow {question} {index} />
	{/each}
	<hr />

	<button {onclick}>+ Add Question</button>
</div>
