<script lang="ts">
	import type { Snippet } from 'svelte';
	import Toggle from './Toggle.svelte';

	let {
		value = $bindable('left'),
		left_label = 'Left',
		right_label = 'Right',
		left,
		right,
		onchange,
		class: _class,
		...rest
	}: {
		value?: 'left' | 'right';
		left_label?: string;
		right_label?: string;
		left: Snippet;
		right: Snippet;
		onchange?: (value: 'left' | 'right') => void;
		class?: string;
	} = $props();
</script>

<div class="di-toggle-group {_class ?? ''}" {...rest}>
	<Toggle bind:value {left_label} {right_label} {onchange} />
	<div class="di-toggle-group-content">
		{#if value === 'left'}
			{@render left()}
		{:else}
			{@render right()}
		{/if}
	</div>
</div>

<style>
	.di-toggle-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: center;
	}

	.di-toggle-group-content {
		width: 100%;
	}
</style>
