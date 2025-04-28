<script lang="ts">
	import type { Answer } from '../../../../../schema';
	let {
		label,
		oninput,
		answer
	}: { label: string; oninput: (value: any, label: string) => void; answer: Answer } = $props();
	function onwa_change(e: CustomEvent<number>) {
		oninput(e.detail, label);
	}
</script>

<wa-rating {label} value={answer?.answer_text} onwa-change={onwa_change}></wa-rating>
