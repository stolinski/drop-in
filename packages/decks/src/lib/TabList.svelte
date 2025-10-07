<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	let { children }: { children: Snippet } = $props();

	type TabsContext = {
		activeValue: () => string | undefined;
		setActiveValue: (v: string) => void;
		orientation: () => 'horizontal' | 'vertical';
		registerTab: (el: HTMLButtonElement, tabValue: string) => void;
		unregisterTab: (el: HTMLButtonElement) => void;
		getTabs: () => Array<{ element: HTMLButtonElement; value: string }>;
	};

	const context = getContext<TabsContext>('tabs');
	if (!context) {
		throw new Error('TabList must be used within a Tabs component');
	}

	const orientation = $derived(context.orientation());

	// Arrow key navigation handler
	function handleKeydown(e: KeyboardEvent) {
		const tabs = context.getTabs();
		const value = context.activeValue();
		if (tabs.length === 0) return;

		const isHorizontal = orientation === 'horizontal';
		const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
		const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

		if (![prevKey, nextKey, 'Home', 'End'].includes(e.key)) return;

		e.preventDefault();

		const currentIndex = tabs.findIndex((t) => t.value === value);
		let targetIndex = currentIndex;

		if (e.key === prevKey) {
			targetIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
		} else if (e.key === nextKey) {
			targetIndex = currentIndex >= tabs.length - 1 ? 0 : currentIndex + 1;
		} else if (e.key === 'Home') {
			targetIndex = 0;
		} else if (e.key === 'End') {
			targetIndex = tabs.length - 1;
		}

		if (targetIndex >= 0 && targetIndex < tabs.length) {
			const targetTab = tabs[targetIndex];
			context.setActiveValue(targetTab.value);
			targetTab.element.focus();
		}
	}
</script>

<div
	class="di-tablist"
	class:di-tablist--horizontal={orientation === 'horizontal'}
	class:di-tablist--vertical={orientation === 'vertical'}
	role="tablist"
	aria-orientation={orientation}
	tabindex="-1"
	onkeydown={handleKeydown}
>
	{@render children()}
	<div class="di-tab-indicator" aria-hidden="true"></div>
</div>

<style>
	.di-tablist {
		position: relative;
		display: flex;
		gap: 0;
	}

	.di-tablist--horizontal {
		flex-direction: row;
		border-bottom: 1px solid var(--di-tab-border-color, #e5e5e5);
	}

	.di-tablist--vertical {
		flex-direction: column;
		border-right: 1px solid var(--di-tab-border-color, #e5e5e5);
	}

	.di-tab-indicator {
		position: absolute;
		background-color: var(--di-tab-indicator-color, #3b82f6);
		transition:
			translate var(--di-motion-duration, 200ms) var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1)),
			width var(--di-motion-duration, 200ms) var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1)),
			height var(--di-motion-duration, 200ms) var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1));
	}

	.di-tablist--horizontal .di-tab-indicator {
		bottom: -1px;
		left: 0;
		height: 2px;
		width: 0;
	}

	.di-tablist--vertical .di-tab-indicator {
		right: -1px;
		top: 0;
		width: 2px;
		height: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.di-tab-indicator {
			transition: none !important;
		}
	}
</style>
