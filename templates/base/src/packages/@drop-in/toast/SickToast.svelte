<script lang="ts">
	// SickToast
	// A simple, standards based toast component.
	// Uses popover / logical properties to position the toast.
	// Delete if you would like to bring your own toaster (ie svelte-french-toast)
	import { fade, fly } from 'svelte/transition';
	import { toast } from './toast.svelte';
	import { flip } from 'svelte/animate';
	import ToastSlice from './ToastSlice.svelte';

	let popover: HTMLDivElement | undefined = $state();

	let {
		position,
		offset = { inline: 0, block: 0 },
	}: {
		position: { inline: 'start' | 'end' | 'center'; block: 'start' | 'end' | 'center' };
		offset?: { inline: number | string; block: number | string };
	} = $props();

	let inline = position.inline === 'center' ? 'inset-inline' : `inset-inline-${position.inline}`;
	let block = position.block === 'center' ? 'inset-block' : `inset-block-${position.inline}`;

	$effect(() => {
		if (toast.status === 'ON') {
			popover?.showPopover();
		} else {
			popover?.hidePopover();
		}
	});
</script>

<div
	popover="manual"
	id="toast-popover"
	bind:this={popover}
	style="{inline}:{offset.inline}; {block}:{offset.block};"
	class="sick-toast"
>
	{#each toast.toasts as message (message.id)}
		<div
			onclick={() => toast.remove(message.id)}
			in:fly={{ opacity: 0, x: 100 }}
			out:fade
			animate:flip
		>
			<ToastSlice {message} />
		</div>
	{/each}
</div>

<style>
	.sick-toast {
		inset: auto;
		opacity: 0;
		transition-behavior: allow-discrete;
		transition-property: opacity, display;
		transition-duration: 0.25s;
		border: none;
	}

	[popover]:popover-open {
		opacity: 1;
	}
</style>
