<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	let {
		value,
		children
	}: {
		value: string;
		children: Snippet;
	} = $props();

	type TabsContext = {
		activeValue: () => string | undefined;
		setActiveValue: (v: string) => void;
		orientation: () => 'horizontal' | 'vertical';
		registerTab: (el: HTMLButtonElement, tabValue: string) => void;
		unregisterTab: (el: HTMLButtonElement) => void;
	};

	const context = getContext<TabsContext>('tabs');
	if (!context) {
		throw new Error('TabPanel must be used within a Tabs component');
	}

	const isActive = $derived(context.activeValue() === value);
</script>

{#if isActive}
	<div
		role="tabpanel"
		id={`tabpanel-${value}`}
		aria-labelledby={`tab-${value}`}
		tabindex="0"
		class="di-tabpanel"
	>
		{@render children()}
	</div>
{/if}

<style>
	.di-tabpanel {
		padding: 1rem;
		outline: none;
	}

	.di-tabpanel:focus-visible {
		outline: 2px solid var(--di-tab-focus-color, #3b82f6);
		outline-offset: 2px;
	}
</style>
