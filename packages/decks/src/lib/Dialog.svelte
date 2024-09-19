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
		confirm_text = 'Ok',
		on_cancel = () => null,
		on_confirm
	}: {
		dialog?: HTMLDialogElement;
		title: string;
		children: Snippet;
		buttons?: boolean;
		active?: boolean;
		show_button: boolean;
		button_text?: string;
		title_element?: 'h3' | 'h4' | 'h5' | 'h6';
		cancel_text?: string;
		confirm_text?: string;
		on_cancel?: () => void;
		on_confirm?: () => void;
	} = $props();

	function close() {
		dialog?.close();
		on_cancel?.();
	}
	function confirm() {
		on_confirm?.();
		dialog?.close();
	}

	$effect(() => {
		if (active) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
</script>

{#if show_button}
	<button class="share" onclick={() => dialog.showModal()}>{button_text}</button>
{/if}

<dialog bind:this={dialog} class="di-dialog">
	{#if title}<svelte:element this={title_element}>{title}</svelte:element>{/if}
	<button onclick={close} class="di-dialog-close">×</button>
	<section class="di-dialog-content">
		{@render children()}
		{#if buttons}
			<div class="di-dialog-buttons">
				<button class="ghost" onclick={close}>{cancel_text}</button>
				<button onclick={confirm}>{confirm_text}</button>
			</div>
		{/if}
	</section>
</dialog>
