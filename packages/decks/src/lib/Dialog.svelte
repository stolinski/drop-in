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
		cancel_class?: string;
		confirm_text?: string;
		confirm_class?: string;
		on_cancel?: () => void;
		on_confirm?: () => void;
	} = $props();

	function close() {
		on_cancel?.();
		dialog.close();
	}
	function confirm() {
		on_confirm?.();
		dialog.close();
	}

	$effect(() => {
		dialog.addEventListener('close', () => {
			active = false;
		});
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
				<button class={cancel_class} onclick={close}>{cancel_text}</button>
				<button class={confirm_class} onclick={confirm}>{confirm_text}</button>
			</div>
		{/if}
	</section>
</dialog>
