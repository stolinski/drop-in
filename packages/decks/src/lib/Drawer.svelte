<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { spring } from 'svelte/motion';
	import { pannable } from './pannable.js';
	import { createFocusScope } from './a11y/focusScope.js';
	import type { FocusScopeController } from './a11y/focusScope.js';
	import { onEscape } from './a11y/escape.js';
	import { lockScroll, unlockScroll } from './a11y/scrollLock.js';
	import { isReducedMotion, motion } from './motion.js';

	let {
		dialog = $bindable(),
		children,
		active = $bindable(false),
		button_text = 'Open',
		show_button = $bindable(false),
		disable_escape = false,
		title,
		onopen,
		onclose,
		oncancel
	} = $props<{
		dialog?: HTMLDialogElement;
		children: Snippet;
		active?: boolean;
		show_button?: boolean;
		button_text?: string;
		disable_escape?: boolean;
		title?: string;
		onopen?: () => void;
		onclose?: () => void;
		oncancel?: () => void;
	}>();

	const coords = spring(
		{ x: 0, y: 600 },
		{
			stiffness: isReducedMotion() ? 1 : 0.2,
			damping: isReducedMotion() ? 1 : 0.4
		}
	);

	let focus_controller: FocusScopeController | null = null;
	let remove_escape: null | (() => void) = null;

	function handlePanStart() {
		coords.stiffness = coords.damping = 1;
	}

	function handlePanMove(event: CustomEvent<{ x: number; y: number; dx: number; dy: number }>) {
		coords.update(($coords) => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}));
	}

	function handlePanEnd() {
		if (isReducedMotion()) {
			coords.stiffness = 1;
			coords.damping = 1;
		} else {
			coords.stiffness = 0.2;
			coords.damping = 0.4;
		}
		coords.set({ x: 0, y: 0 });
	}

	function closeDialog() {
		coords.set({ x: 0, y: window.innerHeight });
		const exit_ms = isReducedMotion() ? 0 : motion.durations.base;
		setTimeout(() => {
			dialog?.close();
		}, exit_ms);
	}

	function openDialog() {
		dialog.showModal();
		void tick();
		coords.set({ x: 0, y: 0 });
		onopen?.();
	}

	function toggle() {
		if (dialog.open) {
			active = false;
		} else {
			active = true;
		}
	}

	function handleCancel() {
		oncancel?.();
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
		if (e.target === dialog) {
			handleCancel();
		}
	}

	$effect(() => {
		if (!dialog) return;
		const onStart = () => handlePanStart();
		const onMove = (e: Event) =>
			handlePanMove(e as CustomEvent<{ x: number; y: number; dx: number; dy: number }>);
		const onEnd = () => handlePanEnd();
		dialog.addEventListener('panstart', onStart);
		dialog.addEventListener('panmove', onMove);
		dialog.addEventListener('panend', onEnd);
		dialog.addEventListener('close', onDialogClosed);
		dialog.addEventListener('cancel', onDialogCanceled);
		dialog.addEventListener('click', onBackdropClick);
		if (active) {
			openDialog();
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
			closeDialog();
			focus_controller?.deactivate();
			if (remove_escape) {
				remove_escape();
				remove_escape = null;
			}
			if (typeof document !== 'undefined') unlockScroll();
		}
		return () => {
			dialog?.removeEventListener('panstart', onStart);
			dialog?.removeEventListener('panmove', onMove);
			dialog?.removeEventListener('panend', onEnd);
			dialog?.removeEventListener('close', onDialogClosed);
			dialog?.removeEventListener('cancel', onDialogCanceled);
			dialog?.removeEventListener('click', onBackdropClick);
			// cleanup
			focus_controller?.deactivate();
			if (remove_escape) remove_escape();
			if (typeof document !== 'undefined') unlockScroll();
		};
	});
</script>

<!-- TODO make drawer close on drag -->

{#if show_button}
	<button class="di-drawer-open-button" onclick={toggle}>{button_text}</button>
{/if}

<dialog
	style="translate:
	0px {$coords.y}px;"
	bind:this={dialog}
	use:pannable
	class="di-drawer"
	aria-modal="true"
	aria-labelledby={title ? 'di-drawer-title' : undefined}
	aria-label={title ? undefined : 'Drawer'}
>
	<div class="di-drawer-handle"></div>
	<button class="di-drawer-close-button" onclick={handleCancel}>×</button>
	<div class="form_drawer_container">
		{#if title}
			<h2 id="di-drawer-title" class="di-drawer-title">{title}</h2>
		{/if}
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

	@media (prefers-reduced-motion: reduce) {
		/* Drawer motion is JS-driven via springs; reduced motion uses stiff springs and zero exit delay. */
		.di-drawer {
			transition: none !important;
		}
	}
</style>
