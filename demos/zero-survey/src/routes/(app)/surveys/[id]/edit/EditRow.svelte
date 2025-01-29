<script lang="ts">
	import { getZ } from 'zero-svelte';

	let { question, index } = $props();
	const z = getZ();

	let current_type = $state($state.snapshot(question.question_type));

	function oninput(e: Event) {
		const form = e.target?.closest('form') as HTMLFormElement;
		const question_text = form['question_text-' + index].value;
		const question_type = form['type-' + index].value;

		z.current.mutate.questions.update({
			id: question.id,
			question_text,
			question_type
		});
	}
</script>

<form {oninput}>
	<div class="row">
		{@render type(index)}
		<label for="question_text">Question</label>
		<input
			type="text"
			name="question_text"
			id="question_text-{index}"
			value={question.question_text}
		/>
	</div>
	<div class="row">
		<label for="description">Description</label>
		<textarea name="description" id="description-{index}">{question.description}</textarea>
	</div>
	<!-- Specific Type Config Fields -->
	{#if current_type === 'text'}
		<div class="row">
			<label for="question_min_length-{index}">Min Length</label>
			<input
				type="text"
				name="question_text"
				id="question_min_length-{index}"
				value={question.config.minLength}
			/>
		</div>
	{:else if current_type === 'long'}{:else if current_type === 'rating'}{:else if current_type === 'choice'}{/if}
</form>

{#snippet type(index: number)}
	<label for={`type-${index}`}>Type</label>
	<select
		name="type"
		id={`type-${index}`}
		defaultValue={question.question_type}
		bind:value={current_type}
	>
		<option value="text">Text</option>
		<option value="long">Long Text</option>
		<option value="rating">Rating</option>
	</select>
{/snippet}
