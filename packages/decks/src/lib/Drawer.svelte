<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { spring } from 'svelte/motion';
	import { pannable } from './pannable';

	let {
		dialog = $bindable(),
		children,
		active = $bindable(false),
		button_text = 'Open',
		onclose = () => {},
		show_button = $bindable(false)
	} = $props<{
		dialog?: HTMLDialogElement;
		children: Snippet;
		active?: boolean;
		show_button?: boolean;
		button_text?: string;
		onclose: () => void;
	}>();

	$inspect(active);

	const coords = spring(
		{ x: 0, y: 600 },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	);

	function handlePanStart() {
		coords.stiffness = coords.damping = 1;
	}

	function handlePanMove(event: CustomEvent) {
		coords.update(($coords) => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}));
	}

	function handlePanEnd() {
		coords.stiffness = 0.2;
		coords.damping = 0.4;
		coords.set({ x: 0, y: 0 });
	}

	function close() {
		coords.set({ x: 0, y: window.innerHeight });
		setTimeout(() => {
			dialog.close();
			onclose();
		}, 200);
	}

	function open() {
		dialog.showModal();
		tick();
		coords.set({ x: 0, y: 0 });
	}

	function toggle() {
		if (dialog.open) {
			active = false;
		} else {
			active = true;
		}
	}

	$effect(() => {
		if (active) {
			open();
		} else {
			close();
		}
	});
</script>

{#if show_button}
	<button class="di-drawer-open-button" onclick={toggle}>{button_text}</button>
{/if}

<dialog
	style="translate:
	0px {$coords.y}px;"
	bind:this={dialog}
	onpanstart={handlePanStart}
	onpanmove={handlePanMove}
	onpanend={handlePanEnd}
	use:pannable
	class="di-drawer"
>
	<div class="di-drawer-handle"></div>
	<button class="di-drawer-close-button" onclick={toggle}>×</button>
	<div class="form_drawer_container">
		{@render children()}
	</div>
</dialog>

<style>
	.di-drawer-handle {
		background: #999;
		height: 10px;
		border-radius: 10px;
		width: 30%;
		margin: 1rem auto var(--vs-l);
	}

	.di-drawer {
		height: 200vb;
		max-height: none;
		width: 98vi;
		inset: 3vb 1vi auto 1vi;
		z-index: 10;
		max-width: none;
	}
</style>
