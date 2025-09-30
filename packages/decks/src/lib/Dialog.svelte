<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createFocusScope } from './a11y/focusScope.js';
	import type { FocusScopeController } from './a11y/focusScope.js';
	import { onEscape } from './a11y/escape.js';
	import { lockScroll, unlockScroll } from './a11y/scrollLock.js';

	let {
		dialog = $bindable(),
		title,
		buttons = true,
		children,
		active = $bindable(false),
		show_button = false,
		button_text = 'Open',
		title_element = 'h5',
		cancel_text = 'Cancel',
		cancel_class,
		confirm_text = 'Ok',
		confirm_class,
		backdrop_click = true,
		disable_escape = false,
		// Component callback props (Svelte 5):
		onopen,
		onclose,
		oncancel,
		onconfirm
	}: {
		dialog?: HTMLDialogElement;
		title: string;
		children: Snippet;
		buttons?: boolean;
		active?: boolean;
		show_button?: boolean;
		button_text?: string;
		title_element?: 'h3' | 'h4' | 'h5' | 'h6';
		cancel_text?: string;
		cancel_class?: string;
		confirm_text?: string;
		confirm_class?: string;
		backdrop_click?: boolean;
		disable_escape?: boolean;
		onopen?: () => void;
		onclose?: () => void;
		oncancel?: () => void;
		onconfirm?: () => void;
	} = $props();

	let focus_controller: FocusScopeController | null = null;
	let remove_escape: null | (() => void) = null;

	function handleCancel() {
		oncancel?.();
		dialog?.close();
	}
	function handleConfirm() {
		onconfirm?.();
		dialog?.close();
	}

	function onDialogClosed() {
		active = false;
		onclose?.();
	}

	function onDialogCanceled(e: Event) {
		// prevent native Escape handling; onEscape stack will handle if enabled
		e.preventDefault();
	}

	function onBackdropClick(e: MouseEvent) {
		if (!backdrop_click) return;
		if (e.target === dialog) {
			// clicking the backdrop should behave like cancel
			handleCancel();
		}
	}

	$effect(() => {
		if (!dialog) return;
		const onCancelListener = (e: Event) => onDialogCanceled(e);
		dialog.addEventListener('close', onDialogClosed);
		dialog.addEventListener('cancel', onCancelListener);
		dialog.addEventListener('click', onBackdropClick);
		if (active) {
			if (!dialog.open) dialog.showModal();
			onopen?.();
			// lock scroll and trap focus
			if (typeof document !== 'undefined') lockScroll();
			if (!focus_controller) focus_controller = createFocusScope(dialog);
			focus_controller.activate();
			// Escape handling only when enabled
			if (!disable_escape) {
				if (!remove_escape) {
					remove_escape = onEscape(() => {
						handleCancel();
					});
				}
			} else if (remove_escape) {
				remove_escape();
				remove_escape = null;
			}
		} else {
			if (dialog.open) dialog.close();
			// release focus and scroll
			focus_controller?.deactivate();
			if (remove_escape) {
				remove_escape();
				remove_escape = null;
			}
			if (typeof document !== 'undefined') unlockScroll();
		}
		return () => {
			dialog?.removeEventListener('close', onDialogClosed);
			dialog?.removeEventListener('cancel', onCancelListener);
			dialog?.removeEventListener('click', onBackdropClick);
			// cleanup in case component is destroyed while open
			focus_controller?.deactivate();
			if (remove_escape) remove_escape();
			if (typeof document !== 'undefined') unlockScroll();
		};
	});
</script>

{#if show_button}
	<button class="share" type="button" onclick={() => (active = true)}>{button_text}</button>
{/if}

<dialog
	bind:this={dialog}
	class="di-dialog"
	aria-modal="true"
	aria-labelledby={title ? 'di-dialog-title' : undefined}
	aria-label={title ? undefined : 'Dialog'}
>
	{#if title}<svelte:element this={title_element} id="di-dialog-title">{title}</svelte:element>{/if}
	<button type="button" onclick={handleCancel} class="di-dialog-close" aria-label="Close dialog"
		>×</button
	>
	<section class="di-dialog-content">
		{@render children()}
		{#if buttons}
			<div class="di-dialog-buttons">
				<button type="button" class={cancel_class} onclick={handleCancel}>{cancel_text}</button>
				<button type="button" class={confirm_class} onclick={handleConfirm}>{confirm_text}</button>
			</div>
		{/if}
	</section>
</dialog>

<style>
	/* Motion baseline tokens via CSS variables */
	.di-dialog {
		opacity: 0;
		translate: 0 10px;
		transition-property: opacity, translate, display;
		transition-duration: var(--di-motion-duration-enter, var(--di-motion-duration, 200ms));
		transition-timing-function: var(--di-motion-ease-in, cubic-bezier(0.2, 0, 0, 1));
		transition-behavior: allow-discrete;
	}

	@starting-style {
		.di-dialog[open] {
			opacity: 0;
			translate: 0 10px;
		}
	}

	.di-dialog[open] {
		opacity: 1;
		translate: 0 0;
		transition-timing-function: var(--di-motion-ease-out, cubic-bezier(0.2, 0, 0, 1));
	}

	@media (prefers-reduced-motion: reduce) {
		.di-dialog {
			transition: none !important;
			translate: none !important;
		}
	}
</style>
