<script lang="ts">
	import { get_cache } from '$lib/z.svelte';

	let { question, index } = $props();
	const cache = get_cache();

	function oninput(e: Event) {
		const form = e.target?.closest('form') as HTMLFormElement;

		const question_text = form.question_text.value;
		const question_type = form.type.value;

		cache.z.mutate.questions.update({
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
</form>

{#snippet type(index: number)}
	<label for={`type-${index}`}>Type</label>
	<select name="type" id={`type-${index}`} value={question.question_type}>
		<option value="text">Text</option>
		<option value="long">Long Text</option>
		<option value="rating">Rating</option>
	</select>
{/snippet}
