<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { spring } from 'svelte/motion';
	import { pannable } from './pannable.js';
	import { lockScroll, unlockScroll } from './a11y/scrollLock.js';
	import { isReducedMotion, motion } from './motion.js';

	let {
		dialog = $bindable(),
		children,
		active = $bindable(false),
		button_text = 'Open',
		show_button = $bindable(false),
		disable_escape = false,
		dismiss_threshold = 0.3,
		velocity_threshold = 0.5,
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
		dismiss_threshold?: number;
		velocity_threshold?: number;
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

	function handlePanStart() {
		coords.stiffness = coords.damping = 1;
	}

	function handlePanMove(event: CustomEvent<{ x: number; y: number; dx: number; dy: number }>) {
		coords.update(($coords) => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}));
	}

	function handlePanEnd(event: CustomEvent<{ x: number; y: number; dx: number; dy: number; velocityY: number }>) {
		if (isReducedMotion()) {
			coords.stiffness = 1;
			coords.damping = 1;
		} else {
			coords.stiffness = 0.2;
			coords.damping = 0.4;
		}

		// Check dismissal criteria
		const threshold = window.innerHeight * dismiss_threshold;
		const velocity = event.detail.velocityY;
		const currentY = $coords.y;
		const shouldDismiss = currentY > threshold || velocity > velocity_threshold;

		if (shouldDismiss) {
			// User dragged far enough or fast enough - dismiss drawer
			active = false;
		} else {
			// Snap back to open position
			coords.set({ x: 0, y: 0 });
		}
	}

	function closeDialog() {
		coords.set({ x: 0, y: window.innerHeight });
		const exit_ms = isReducedMotion() ? 0 : motion.durations.base;
		setTimeout(() => {
			dialog?.close();
			// Cleanup scroll lock after animation completes
			if (typeof document !== 'undefined') unlockScroll();
		}, exit_ms);
	}

	function openDialog() {
		// Native dialog.showModal() provides focus trap automatically
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
		if (disable_escape) {
			// User wants to disable Escape - prevent native behavior
			e.preventDefault();
		} else {
			// Use native Escape - just trigger our cancel callback
			handleCancel();
		}
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
		const onEnd = (e: Event) => handlePanEnd(e as CustomEvent<{ x: number; y: number; dx: number; dy: number; velocityY: number }>);
		dialog.addEventListener('panstart', onStart);
		dialog.addEventListener('panmove', onMove);
		dialog.addEventListener('panend', onEnd);
		dialog.addEventListener('close', onDialogClosed);
		dialog.addEventListener('cancel', onDialogCanceled);
		dialog.addEventListener('click', onBackdropClick);
		if (active) {
			openDialog();
			// Only add what native dialog doesn't provide:
			// Scroll lock (native dialog doesn't reliably prevent body scroll)
			if (typeof document !== 'undefined') lockScroll();
		} else {
			closeDialog();
		}
		return () => {
			dialog?.removeEventListener('panstart', onStart);
			dialog?.removeEventListener('panmove', onMove);
			dialog?.removeEventListener('panend', onEnd);
			dialog?.removeEventListener('close', onDialogClosed);
			dialog?.removeEventListener('cancel', onDialogCanceled);
			dialog?.removeEventListener('click', onBackdropClick);
			// Cleanup scroll lock if dialog is destroyed while open
			if (typeof document !== 'undefined') unlockScroll();
		};
	});
</script>

{#if show_button}
	<button type="button" class="di-drawer-open-button" onclick={toggle}>{button_text}</button>
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
	<button type="button" class="di-drawer-close-button" onclick={handleCancel}>×</button>
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
