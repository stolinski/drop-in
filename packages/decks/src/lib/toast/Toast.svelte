<script lang="ts">
	// A simple, standards based toast component.
	// Uses popover / logical properties to position the toast.
	import { fade, fly } from 'svelte/transition';
	import { toaster } from './toaster.svelte';
	import { flip } from 'svelte/animate';
	import ToastSlice from './ToastSlice.svelte';

	let popover: HTMLDivElement | undefined = $state();

	let {
		position,
		offset = { inline: 0, block: 0 }
	}: {
		position: { inline: 'start' | 'end' | 'center'; block: 'start' | 'end' | 'center' };
		offset?: { inline: number | string; block: number | string };
	} = $props();

	let inline = position.inline === 'center' ? 'inset-inline' : `inset-inline-${position.inline}`;
	let block = position.block === 'center' ? 'inset-block' : `inset-block-${position.block}`;

	$effect(() => {
		if (toaster.status === 'ON') {
			popover?.showPopover();
		} else {
			popover?.hidePopover();
		}
	});

	function onToastKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
			e.preventDefault();
			toaster.remove(id);
		}
	}
</script>

<div
	popover="manual"
	id="toast-popover"
	bind:this={popover}
	style="{inline}:{offset.inline}; {block}:{offset.block};"
	class="di-toast"
>
	{#each toaster.toasts as message (message.id)}
		<div
			role="button"
			tabindex="0"
			onclick={() => toaster.remove(message.id)}
			onkeydown={(e) => onToastKeydown(e, message.id)}
			in:fly|local={{
				opacity: 0,
				x: 100,
				duration:
					typeof window !== 'undefined' &&
					window.matchMedia &&
					window.matchMedia('(prefers-reduced-motion: reduce)').matches
						? 0
						: 200
			}}
			out:fade|local={{
				duration:
					typeof window !== 'undefined' &&
					window.matchMedia &&
					window.matchMedia('(prefers-reduced-motion: reduce)').matches
						? 0
						: 150
			}}
			animate:flip={{
				duration:
					typeof window !== 'undefined' &&
					window.matchMedia &&
					window.matchMedia('(prefers-reduced-motion: reduce)').matches
						? 0
						: 200
			}}
			style="margin-top: var(--vs-s);"
		>
			<ToastSlice {message} />
		</div>
	{/each}
</div>

<style>
	.di-toast {
		inset: auto;
		opacity: 0;
		transition-behavior: allow-discrete;
		transition-property: opacity, display;
		transition-duration: var(--di-motion-duration-enter, var(--di-motion-duration, 200ms));
		border: none;
		overflow: visible;
	}

	@media (prefers-reduced-motion: reduce) {
		.di-toast {
			transition: none !important;
		}
	}

	[popover]:popover-open {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		/* disable flip/fly/fade timing via CSS hook; Svelte transitions are local but CSS vars drive their duration where possible */
		[popover],
		[popover]:popover-open {
			transition: none !important;
		}
	}
</style>
