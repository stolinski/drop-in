<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		link,
		onclick
	}: {
		children: Snippet;
		onclick?: () => unknown;
		link?: string;
	} = $props();
</script>

{#if link}
	<a href={link}><span>{@render children()}</span></a>
{:else if onclick}
	<button {onclick}><span>{@render children()}</span></button>
{:else}
	<span>{@render children()}</span>
{/if}

<style>
	a {
		text-decoration: none;
	}
	span {
		display: inline-block;
		padding: 2px 12px;
		color: var(--c-fg);
		border: 1px solid var(--c-fg);
		border-radius: 20px;
		font-size: var(--fs-xs);
	}

	button {
		background: transparent;
		padding: 0;
	}
</style>
