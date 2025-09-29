<script lang="ts">
	import type { Snippet } from 'svelte';

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
		// Component callback props (Svelte 5):
		open,
		close,
		cancel,
		confirm
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
		open?: () => void;
		close?: () => void;
		cancel?: () => void;
		confirm?: () => void;
	} = $props();

	function handleCancel() {
		cancel?.();
		dialog?.close();
	}
	function handleConfirm() {
		confirm?.();
		dialog?.close();
	}

	function onDialogClosed() {
		active = false;
		close?.();
	}

	function onDialogCanceled() {
		cancel?.();
		// native cancel will close the dialog; no need to call close() here
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
		dialog.addEventListener('close', onDialogClosed);
		dialog.addEventListener('cancel', onDialogCanceled);
		dialog.addEventListener('click', onBackdropClick);
		if (active) {
			if (!dialog.open) dialog.showModal();
			open?.();
		} else {
			if (dialog.open) dialog.close();
		}
		return () => {
			dialog?.removeEventListener('close', onDialogClosed);
			dialog?.removeEventListener('cancel', onDialogCanceled);
			dialog?.removeEventListener('click', onBackdropClick);
		};
	});
</script>

{#if show_button}
	<button class="share" type="button" onclick={() => (active = true)}>{button_text}</button>
{/if}

<dialog bind:this={dialog} class="di-dialog" aria-label={title}>
	{#if title}<svelte:element this={title_element}>{title}</svelte:element>{/if}
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
