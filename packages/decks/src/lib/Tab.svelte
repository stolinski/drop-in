<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	let {
		value,
		children,
		disabled = false
	}: {
		value: string;
		children: Snippet;
		disabled?: boolean;
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
		throw new Error('Tab must be used within a Tabs component');
	}

	let button: HTMLButtonElement | undefined = $state();
	const isActive = $derived(context.activeValue() === value);

	function handleClick() {
		if (!disabled) {
			context.setActiveValue(value);
		}
	}

	// Register/unregister on mount/destroy
	$effect(() => {
		if (button) {
			context.registerTab(button, value);
			return () => {
				if (button) {
					context.unregisterTab(button);
				}
			};
		}
	});

	// Update indicator position when this tab becomes active
	$effect(() => {
		if (isActive && button) {
			updateIndicator();
		}
	});

	function updateIndicator() {
		if (!button) return;
		const tablist = button.parentElement;
		if (!tablist) return;

		const indicator = tablist.querySelector('.di-tab-indicator') as HTMLElement;
		if (!indicator) return;

		const orientation = context.orientation();
		const rect = button.getBoundingClientRect();
		const listRect = tablist.getBoundingClientRect();

		if (orientation === 'horizontal') {
			const left = rect.left - listRect.left;
			indicator.style.translate = `${left}px 0`;
			indicator.style.width = `${rect.width}px`;
		} else {
			const top = rect.top - listRect.top;
			indicator.style.translate = `0 ${top}px`;
			indicator.style.height = `${rect.height}px`;
		}
	}
</script>

<button
	bind:this={button}
	type="button"
	role="tab"
	aria-selected={isActive}
	aria-controls={`tabpanel-${value}`}
	id={`tab-${value}`}
	tabindex={isActive ? 0 : -1}
	{disabled}
	class="di-tab"
	class:di-tab--active={isActive}
	onclick={handleClick}
>
	{@render children()}
</button>

<style>
	.di-tab {
		position: relative;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		color: var(--di-tab-color, #64748b);
		cursor: pointer;
		transition: color var(--di-motion-duration, 200ms);
		white-space: nowrap;
	}

	.di-tab:hover:not(:disabled) {
		color: var(--di-tab-hover-color, #334155);
	}

	.di-tab:focus-visible {
		outline: 2px solid var(--di-tab-focus-color, #3b82f6);
		outline-offset: -2px;
		z-index: 1;
	}

	.di-tab--active {
		color: var(--di-tab-active-color, #3b82f6);
	}

	.di-tab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.di-tab {
			transition: none !important;
		}
	}
</style>
