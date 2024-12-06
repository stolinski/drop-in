<script lang="ts">
	import type { Answer } from '../../../../../schema';

	let {
		label,
		oninput,
		answer
	}: { label: string; oninput: (value: any, label: string) => void; answer: Answer } = $props();
</script>

<label for={label}>{label}</label>
<textarea
	value={answer?.answer_text}
	oninput={(e) => {
		e.stopPropagation();
		oninput(e.target?.value, label);
	}}
	name="answer"
></textarea>

<style>
	textarea {
		width: 100%;
	}
</style>
