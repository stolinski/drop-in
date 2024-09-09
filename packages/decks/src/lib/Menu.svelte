<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		children,
		button,
		name,
		vert = 'BOTTOM',
		horizontal = 'LEFT',
		button_class = ''
	}: {
		children: Snippet;
		button: Snippet;
		vert?: 'TOP' | 'BOTTOM';
		horizontal?: 'LEFT' | 'RIGHT';
		name: string;
		button_class?: string;
	} = $props();

	let menu: null | HTMLElement = $state(null);
	let trigger: null | HTMLElement = $state(null);

	function update_position() {
		if (trigger && menu) {
			const trigger_position = trigger.getBoundingClientRect();

			const menu_position = menu.getBoundingClientRect();
			menu.style.inset = 'unset';
			if (vert === 'BOTTOM') {
				menu.style.top = trigger_position.bottom + 'px';
			} else {
				menu.style.top = trigger_position.top + 'px';
			}
			if (horizontal === 'LEFT') {
				menu.style.left = trigger_position.left + 'px';
			} else {
				menu.style.left = trigger_position.right - menu_position.width + 'px';
			}
		}
	}

	$effect(() => {
		if (menu) {
			const resizeObserver = new ResizeObserver(update_position);
			resizeObserver.observe(menu);
			window.addEventListener('resize', update_position);
			window.addEventListener('scroll', update_position);
		}
	});
</script>

<div style="position: relative; ">
	<div bind:this={trigger}>
		<button class={button_class} popovertarget={name}>
			{@render button()}
		</button>
	</div>
	<div
		popover="auto"
		bind:this={menu}
		id={name}
		class="di-menu"
		onclick={(e) => menu.hidePopover()}
	>
		<div class="di-menu-inner">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.di-menu {
		translate: 0 10px;
		transition-timing-function: ease-in;
		/* opacity: 0; */
		transition:
			opacity 0.3s,
			translate 0.3s;
	}

	.menu-inner {
		flex-direction: column;
		display: flex;
		align-items: flex-start;
	}

	@starting-style {
		*[popover]:popover-open {
			opacity: 0;
			translate: 0 10px;
		}
	}

	*[popover]:popover-open {
		opacity: 1;
		translate: 0 0;
		transition-timing-function: ease-out;
	}
</style>
