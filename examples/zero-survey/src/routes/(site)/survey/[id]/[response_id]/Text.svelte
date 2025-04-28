<script lang="ts">
	import type { Answer } from '../../../../../schema';

	let {
		label,
		oninput,
		answer
	}: { label: string; oninput: (value: any, label: string) => void; answer: Answer } = $props();
</script>

<label for={label}>{label}</label>
<input
	type="text"
	value={answer?.answer_text}
	oninput={(e) => {
		e.stopPropagation();
		oninput(e.target?.value, label);
	}}
	name="answer"
/>

<style>
	input {
		width: 100%;
	}
</style>
