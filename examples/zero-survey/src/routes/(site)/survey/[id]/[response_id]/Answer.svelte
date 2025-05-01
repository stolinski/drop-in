<script lang="ts">
	import { page } from '$app/stores';
	import { getZ } from 'zero-svelte';
	import { nanoid } from 'nanoid';
	import Rating from './Rating.svelte';
	import Text from './Text.svelte';
	import LongText from './LongText.svelte';
	import type { Answer, Question } from '../../../../../schema';
	let { question }: { question: Question & { answers: Answer } } = $props();
	const cache = getZ();

	function oninput(value: any) {
		if (question.answers) {
			cache.z.mutate.answers.update({
				id: question.answers.id,
				response_id: $page.params.response_id,
				question_id: question.id,
				answer_text: String(value)
			});
		} else {
			cache.z.mutate.answers.insert({
				id: nanoid(),
				response_id: $page.params.response_id,
				question_id: question.id,
				answer_text: String(value)
			});
		}
	}
</script>

<form>
	<div class="row">
		<p>{question.question_text}</p>
		{#if question.question_type === 'text'}
			<Text {oninput} answer={question.answers} label="Text"></Text>
		{:else if question.question_type === 'long'}
			<LongText {oninput} answer={question.answers} label="Long"></LongText>
		{:else if question?.question_type === 'rating'}
			<Rating {oninput} answer={question.answers} label="Rating"></Rating>
		{/if}
	</div>
</form>
