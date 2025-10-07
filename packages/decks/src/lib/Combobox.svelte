<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		items = [],
		value = $bindable(''),
		placeholder = '',
		name,
		id = `combobox-${crypto.randomUUID()}`,
		label,
		disabled = false,
		required = false,
		autocomplete = 'both',
		onchange,
		onselect,
		class: className = '',
		input_class = 'di-combobox-input',
		listbox_class = 'di-combobox-listbox',
		option_class = 'di-combobox-option',
		children
	}: {
		items?: string[] | { value: string; label: string; disabled?: boolean }[];
		value?: string;
		placeholder?: string;
		name?: string;
		id?: string;
		label?: string;
		disabled?: boolean;
		required?: boolean;
		autocomplete?: 'none' | 'inline' | 'list' | 'both';
		onchange?: (value: string) => void;
		onselect?: (value: string) => void;
		class?: string;
		input_class?: string;
		listbox_class?: string;
		option_class?: string;
		children?: Snippet<[{ option: string | { value: string; label: string; disabled?: boolean } }]>;
	} = $props();

	let input_ref: HTMLInputElement | null = $state(null);
	let listbox_ref: HTMLDivElement | null = $state(null);
	let active_index = $state(-1);
	let is_focused = $state(false);
	let is_open = $state(false);
	let filtered_items = $derived(filter_items());

	const listbox_id = `${id}-listbox`;
	const label_id = label ? `${id}-label` : undefined;

	function normalize_items() {
		return items.map((item) => {
			if (typeof item === 'string') {
				return { value: item, label: item, disabled: false };
			}
			return { ...item, disabled: item.disabled ?? false };
		});
	}

	function filter_items() {
		const normalized = normalize_items();
		if (!value || autocomplete === 'none') {
			return normalized;
		}
		const search = value.toLowerCase();
		return normalized.filter((item) => item.label.toLowerCase().includes(search));
	}

	function get_active_option_id(): string | null {
		if (active_index === -1 || !filtered_items[active_index]) return null;
		return `${id}-option-${active_index}`;
	}

	function set_active_index(index: number) {
		if (index < -1) {
			active_index = -1;
			return;
		}
		if (index >= filtered_items.length) {
			active_index = filtered_items.length - 1;
			return;
		}
		// Skip disabled items
		let i = index;
		const dir = index >= active_index ? 1 : -1;
		for (let c = 0; c < filtered_items.length; c += 1) {
			const candidate = filtered_items[(i + filtered_items.length) % filtered_items.length];
			if (!candidate?.disabled) {
				active_index = (i + filtered_items.length) % filtered_items.length;
				return;
			}
			i += dir;
		}
	}

	function select_option(index: number) {
		const item = filtered_items[index];
		if (!item || item.disabled) return;

		// Set focus to false FIRST to prevent $effect from reopening popover
		is_focused = false;
		is_open = false;
		value = item.value;
		listbox_ref?.hidePopover();
		active_index = -1;
		input_ref?.blur(); // Remove focus to close popover

		if (onselect) {
			onselect(item.value);
		}
		if (onchange) {
			onchange(item.value);
		}
	}

	function handle_input_change(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		active_index = -1;

		if (onchange) {
			onchange(target.value);
		}
	}

	function handle_input_focus() {
		is_focused = true;
	}

	function handle_input_blur(e: FocusEvent) {
		// Delay blur to allow option clicks to register
		setTimeout(() => {
			// Check if focus is still outside both input and listbox
			const activeEl = document.activeElement;
			if (activeEl !== input_ref && !listbox_ref?.contains(activeEl)) {
				is_focused = false;
			}
		}, 150);
	}

	// Use $effect to reactively manage popover based on filtered_items
	$effect(() => {
		if (!listbox_ref) return;

		const should_be_open = is_focused && filtered_items.length > 0;

		if (should_be_open && !is_open) {
			listbox_ref.showPopover();
			is_open = true;
		} else if (!should_be_open && is_open) {
			listbox_ref.hidePopover();
			is_open = false;
		}
	})

	function handle_input_keydown(e: KeyboardEvent) {
		const key = e.key;

		if (key === 'ArrowDown') {
			e.preventDefault();
			if (!is_open) {
				listbox_ref?.showPopover();
				is_open = true;
				active_index = 0;
				set_active_index(0);
			} else {
				set_active_index(active_index + 1);
			}
			scroll_active_into_view();
			return;
		}

		if (key === 'ArrowUp') {
			e.preventDefault();
			if (!is_open) {
				listbox_ref?.showPopover();
				is_open = true;
				active_index = filtered_items.length - 1;
				set_active_index(filtered_items.length - 1);
			} else {
				set_active_index(active_index - 1);
			}
			scroll_active_into_view();
			return;
		}

		if (key === 'Enter') {
			e.preventDefault();
			if (is_open && filtered_items.length > 0) {
				// Select active option, or first option if none active
				const index = active_index >= 0 ? active_index : 0;
				select_option(index);
			}
			return;
		}

		if (key === 'Escape') {
			e.preventDefault();
			if (is_open) {
				listbox_ref?.hidePopover();
				is_open = false;
				active_index = -1;
			} else {
				value = '';
				if (onchange) {
					onchange('');
				}
			}
			return;
		}

		if (key === 'Home') {
			if (is_open) {
				e.preventDefault();
				set_active_index(0);
				scroll_active_into_view();
			}
			return;
		}

		if (key === 'End') {
			if (is_open) {
				e.preventDefault();
				set_active_index(filtered_items.length - 1);
				scroll_active_into_view();
			}
			return;
		}

		if (key === 'Tab') {
			// Select active option before closing if one is highlighted
			if (is_open && active_index >= 0 && filtered_items.length > 0) {
				e.preventDefault();
				select_option(active_index);
			} else if (is_open) {
				listbox_ref?.hidePopover();
				is_open = false;
				active_index = -1;
			}
			return;
		}
	}

	function handle_option_click(index: number) {
		select_option(index);
	}

	function handle_option_mouseenter(index: number) {
		if (!filtered_items[index]?.disabled) {
			active_index = index;
		}
	}

	function scroll_active_into_view() {
		if (is_open && active_index >= 0 && listbox_ref) {
			const active_option = listbox_ref.querySelector(`#${get_active_option_id()}`);
			if (active_option) {
				active_option.scrollIntoView({ block: 'nearest' });
			}
		}
	}
</script>

<div class="di-combobox {className}">
	{#if label}
		<label id={label_id} for={id} class="di-combobox-label">
			{label}
			{#if required}<span aria-label="required">*</span>{/if}
		</label>
	{/if}

	<div class="di-combobox-wrapper">
		<input
			bind:this={input_ref}
			type="text"
			{id}
			{name}
			{placeholder}
			{disabled}
			{required}
			class={input_class}
			role="combobox"
			aria-autocomplete={autocomplete}
			aria-controls={listbox_id}
			aria-expanded={is_open}
			aria-activedescendant={get_active_option_id()}
			aria-labelledby={label_id}
			style="anchor-name: --{id}-anchor;"
			bind:value
			oninput={handle_input_change}
			onfocus={handle_input_focus}
			onblur={handle_input_blur}
			onkeydown={handle_input_keydown}
		/>

		<div
			bind:this={listbox_ref}
			id={listbox_id}
			class={listbox_class}
			role="listbox"
			aria-labelledby={label_id}
			popover="manual"
			style="position-anchor: --{id}-anchor; top: anchor(bottom); left: anchor(left);"
		>
			{#each filtered_items as item, index (item.value)}
				{@const option_id = `${id}-option-${index}`}
				{@const is_active = index === active_index}
				{@const is_disabled = item.disabled}

				<div
					id={option_id}
					role="option"
					class="{option_class} {is_active ? 'active' : ''} {is_disabled ? 'disabled' : ''}"
					aria-selected={is_active}
					aria-disabled={is_disabled}
					onmousedown={(e) => {
						if (!is_disabled) {
							e.preventDefault();
							e.stopPropagation();
							handle_option_click(index);
						}
					}}
					onmouseenter={() => handle_option_mouseenter(index)}
				>
					{#if children}
						{@render children({ option: item })}
					{:else}
						{item.label}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.di-combobox {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.di-combobox-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.di-combobox-wrapper {
		/* No position needed - anchor positioning handles layout */
	}

	.di-combobox-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		background: var(--di-combobox-listbox, var(--di-bg));
	}

	.di-combobox-input:focus {
		outline: 2px solid #0066cc;
		outline-offset: 2px;
	}

	.di-combobox-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.di-combobox-listbox {
		margin: 0.25rem 0 0 0;
		max-height: 16rem;
		min-width: anchor-size(width);
		overflow-y: auto;
		background: var(--di-combobox-listbox, var(--di-bg));
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition:
			opacity var(--di-motion-duration, 200ms) var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1)),
			translate var(--di-motion-duration, 200ms) var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1)),
			display var(--di-motion-duration, 200ms) var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1))
				allow-discrete,
			overlay var(--di-motion-duration, 200ms) var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1))
				allow-discrete;
	}

	.di-combobox-listbox:popover-open {
		opacity: 1;
		translate: 0 0;
	}

	@starting-style {
		.di-combobox-listbox:popover-open {
			opacity: 0;
			translate: 0 -8px;
		}
	}

	.di-combobox-option {
		padding: 0.5rem;
		cursor: pointer;
		user-select: none;
		transition: background-color 100ms ease;
	}

	.di-combobox-option.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.di-combobox-listbox {
			transition: none;
			opacity: 1 !important;
			translate: none !important;
		}
		.di-combobox-option {
			transition: none;
		}
	}
</style>
