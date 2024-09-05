<script lang="ts">
	import { fade } from 'svelte/transition';

	const {
		onclick,
		attempts = 2,
		text = 'Are you sure?',
		inline_warning = true,
		action_class = 'warning-btn',
		class: _class,
		...rest
	}: {
		onclick: () => unknown;
		attempts?: number;
		text?: string;
		inline_warning?: boolean;
		action_class?: string;
		class?: string;
	} = $props();

	let attempt_count = $state(0);
	let remaining = $derived(attempts - attempt_count);
	let one_more_left = $derived(remaining === 1);

	function attempt() {
		if (one_more_left) {
			onclick();
			attempt_count = 0;
		} else {
			attempt_count += 1;
		}
	}
</script>

<div class="di-are-you-sure class={_class}">
	<button {rest} onclick={attempt} class={one_more_left ? action_class : ''}>{text}</button>
	{#if attempt_count !== 0}
		<span transition:fade>
			Press {remaining} more time{one_more_left ? '' : 's'}.
		</span>
	{/if}
</div>

<style>
	div {
		position: relative;
	}

	span {
		position: absolute;
		top: 100%;
		left: 0;
	}
</style>
