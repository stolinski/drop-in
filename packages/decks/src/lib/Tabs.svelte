<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';

	let {
		value = $bindable(),
		orientation = 'horizontal',
		onchange,
		children
	}: {
		value?: string;
		orientation?: 'horizontal' | 'vertical';
		onchange?: (value: string) => void;
		children: Snippet;
	} = $props();

	// Context shared with Tab and TabPanel children
	type TabsContext = {
		activeValue: () => string | undefined;
		setActiveValue: (v: string) => void;
		orientation: () => 'horizontal' | 'vertical';
		registerTab: (el: HTMLButtonElement, tabValue: string) => void;
		unregisterTab: (el: HTMLButtonElement) => void;
		getTabs: () => Array<{ element: HTMLButtonElement; value: string }>;
	};

	// Internal state - plain array, not $state (modified imperatively from effects)
	let tabs: Array<{ element: HTMLButtonElement; value: string }> = [];

	function registerTab(el: HTMLButtonElement, tabValue: string) {
		tabs.push({ element: el, value: tabValue });
		updateRovingTabindex();
		// Initialize first tab if no value set
		if (!value) {
			value = tabs[0].value;
		}
	}

	function unregisterTab(el: HTMLButtonElement) {
		tabs = tabs.filter((t) => t.element !== el);
		updateRovingTabindex();
	}

	function setActiveValue(v: string) {
		value = v;
		onchange?.(v);
		updateRovingTabindex();
	}

	function updateRovingTabindex() {
		tabs.forEach((t) => {
			if (t.value === value) {
				t.element.setAttribute('tabindex', '0');
			} else {
				t.element.setAttribute('tabindex', '-1');
			}
		});
	}

	const context: TabsContext = {
		activeValue: () => value,
		setActiveValue,
		orientation: () => orientation,
		registerTab,
		unregisterTab,
		getTabs: () => tabs
	};

	setContext('tabs', context);
</script>

<div
	class="di-tabs"
	class:di-tabs--horizontal={orientation === 'horizontal'}
	class:di-tabs--vertical={orientation === 'vertical'}
>
	{@render children()}
</div>

<style>
	.di-tabs {
		display: flex;
	}

	.di-tabs--horizontal {
		flex-direction: column;
	}

	.di-tabs--vertical {
		flex-direction: row;
	}

	@media (prefers-reduced-motion: reduce) {
		.di-tabs {
			transition: none !important;
		}
	}
</style>
