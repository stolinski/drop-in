<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		children,
		button,
		name,
		vert = 'BOTTOM',
		horizontal = 'LEFT',
		button_class = 'di-menu-button',
		disable_escape = false
	}: {
		children: Snippet;
		button: Snippet;
		vert?: 'TOP' | 'BOTTOM';
		horizontal?: 'LEFT' | 'RIGHT';
		name: string;
		button_class?: string;
		disable_escape?: boolean;
	} = $props();

	let menu: null | HTMLElement = $state(null);
	let trigger: null | HTMLElement = $state(null);
	let is_open = $state(false);

	// roving tabindex state
	let items: HTMLElement[] = [];
	let active_index = -1;

	function isDisabled(el: HTMLElement): boolean {
		const aria = el.getAttribute('aria-disabled');
		const disabledAttr = (el as HTMLButtonElement).disabled === true;
		return aria === 'true' || disabledAttr || el.getAttribute('data-disabled') === 'true';
	}

	function setActive(index: number, opts: { focus?: boolean } = { focus: true }) {
		if (!menu || items.length === 0) return;
		// clamp and skip disabled
		let i = index;
		const dir = index >= active_index ? 1 : -1;
		for (let c = 0; c < items.length; c += 1) {
			const candidate = items[(i + items.length) % items.length];
			if (!isDisabled(candidate)) {
				active_index = (i + items.length) % items.length;
				break;
			}
			i += dir;
		}
		items.forEach((el, idx) => {
			if (idx === active_index) {
				el.setAttribute('tabindex', '0');
				if (opts.focus) el.focus();
			} else {
				el.setAttribute('tabindex', '-1');
			}
		});
	}

	function collect_items() {
		if (!menu) return;
		const candidates = Array.from(
			menu.querySelectorAll<HTMLElement>(
				'[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], button, a, [data-menu-item]'
			)
		);
		// ensure role for common elements
		candidates.forEach((el) => {
			const role = el.getAttribute('role');
			if (!role && (el.tagName === 'BUTTON' || el.tagName === 'A')) {
				el.setAttribute('role', 'menuitem');
			}
		});
		items = candidates.filter((el) => !el.hasAttribute('hidden'));
		// initialize roving tabindex
		items.forEach((el) => el.setAttribute('tabindex', '-1'));
		// set first enabled as active
		active_index = items.findIndex((el) => !isDisabled(el));
		if (active_index === -1) active_index = 0;
		setActive(active_index, { focus: true });
	}

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

	function handle_open() {
		if (!menu) return;
		is_open = true;
		// collect items for roving tabindex
		queueMicrotask(() => collect_items());
	}

	function handle_close() {
		is_open = false;
	}

	$effect(() => {
		if (menu) {
			const resizeObserver = new ResizeObserver(update_position);
			resizeObserver.observe(menu);
			const onResize = () => update_position();
			const onScroll = () => update_position();
			window.addEventListener('resize', onResize);
			window.addEventListener('scroll', onScroll);
			const onToggle = () => {
				const nowOpen = menu?.matches(':popover-open');
				if (nowOpen) handle_open();
				else handle_close();
			};
			menu.addEventListener('toggle', onToggle);
			return () => {
				resizeObserver.disconnect();
				window.removeEventListener('resize', onResize);
				window.removeEventListener('scroll', onScroll);
				menu?.removeEventListener('toggle', onToggle);
				// ensure cleanup if component is destroyed while open
				handle_close();
			};
		}
	});

	function onMenuKeydown(e: KeyboardEvent) {
		if (!menu) return;
		const key = e.key;
		// Native popover handles Escape automatically unless disabled
		if (key === 'Escape' && disable_escape) {
			e.preventDefault();
			return;
		}
		if (key === 'Tab') {
			// Tab closes menu and moves focus - let native behavior work
			menu.hidePopover();
			return;
		}
		if (key === 'Enter' || key === ' ') {
			// let the click/activation bubble; close menu (common behavior)
			menu.hidePopover();
			return;
		}
		if (!items || items.length === 0) return;
		if (key === 'ArrowDown') {
			e.preventDefault();
			setActive((active_index + 1) % items.length);
			return;
		}
		if (key === 'ArrowUp') {
			e.preventDefault();
			setActive((active_index - 1 + items.length) % items.length);
			return;
		}
		if (key === 'Home') {
			e.preventDefault();
			setActive(0);
			return;
		}
		if (key === 'End') {
			e.preventDefault();
			setActive(items.length - 1);
			return;
		}
		// typeahead (single character)
		if (key.length === 1 && /\S/.test(key)) {
			const ch = key.toLowerCase();
			const start = (active_index + 1) % items.length;
			for (let i = 0; i < items.length; i += 1) {
				const idx = (start + i) % items.length;
				const el = items[idx];
				if (isDisabled(el)) continue;
				const label = (el.textContent || '').trim().toLowerCase();
				if (label.startsWith(ch)) {
					setActive(idx);
					break;
				}
			}
		}
	}
</script>

<div class="di-menu-container" style="position: relative;">
	<div bind:this={trigger}>
		<button
			id={`${name}-trigger`}
			class={button_class}
			popovertarget={name}
			aria-haspopup="menu"
			aria-controls={name}
			aria-expanded={is_open ? 'true' : 'false'}
		>
			{@render button()}
		</button>
	</div>
	<div
		popover="auto"
		bind:this={menu}
		id={name}
		class="di-menu"
		role="menu"
		aria-labelledby={`${name}-trigger`}
		tabindex="-1"
		onclick={() => menu?.hidePopover()}
		onkeydown={onMenuKeydown}
	>
		<div class="di-menu-inner">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.di-menu {
		translate: 0 10px;
		transition-timing-function: var(--di-motion-ease-in, cubic-bezier(0.2, 0, 0, 1));
		transition:
			opacity var(--di-motion-duration-enter, var(--di-motion-duration, 200ms)),
			translate var(--di-motion-duration-enter, var(--di-motion-duration, 200ms));
		transition-behavior: allow-discrete;
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
		transition-timing-function: var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1));
	}

	@media (prefers-reduced-motion: reduce) {
		.di-menu,
		*[popover]:popover-open {
			transition: none !important;
			translate: none !important;
		}
	}
</style>
