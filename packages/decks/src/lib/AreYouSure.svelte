<script lang="ts">
	import { fade } from 'svelte/transition';
	import { isReducedMotion } from './motion.js';

	let {
		attempts = 2,
		text = 'Are you sure?',
		inline_warning: _inline_warning = true,

		action_class = 'warning-btn',
		class: _class,
		onconfirm,
		...rest
	}: {
		attempts?: number;
		text?: string;
		inline_warning?: boolean;
		action_class?: string;
		class?: string;
		onconfirm?: () => void;
	} = $props();
	// mark as used to preserve prop while unused internally
	void _inline_warning;

	let attempt_count = $state(0);
	let remaining = $derived(attempts - attempt_count);
	let one_more_left = $derived(remaining === 1);
	const reduced = isReducedMotion();

	function attempt() {
		if (one_more_left) {
			onconfirm?.();
			attempt_count = 0;
		} else {
			attempt_count += 1;
		}
	}
</script>

<div class="di-are-you-sure class={_class}">
	<button {...rest} onclick={attempt} class={one_more_left ? action_class : ''}>{text}</button>
	{#if attempt_count !== 0}
		<span transition:fade|local={{ duration: reduced ? 0 : 150 }}>
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
