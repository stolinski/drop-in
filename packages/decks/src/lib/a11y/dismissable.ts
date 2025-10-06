import { createFocusScope } from './focusScope.js';
import type { FocusScopeController } from './focusScope.js';
import { onEscape } from './escape.js';
import { lockScroll, unlockScroll } from './scrollLock.js';

/**
 * Options for creating a dismissable overlay.
 */
export type DismissableOptions = {
	/**
	 * Callback invoked when the overlay should be dismissed.
	 */
	onDismiss: () => void;
	/**
	 * Enable Escape key to dismiss. Default: true
	 */
	enableEscape?: boolean;
	/**
	 * Enable click outside overlay to dismiss. Default: true
	 */
	enableOutsideClick?: boolean;
	/**
	 * Enable focus trapping within overlay. Default: true
	 */
	enableFocusTrap?: boolean;
	/**
	 * Enable background scroll locking. Default: true
	 */
	enableScrollLock?: boolean;
	/**
	 * Initial element to focus when overlay opens.
	 */
	initialFocus?: HTMLElement | null;
};

/**
 * Controller returned by createDismissable.
 */
export type DismissableController = {
	/**
	 * Activate the dismissable overlay (focus trap, scroll lock, listeners).
	 */
	activate: () => void;
	/**
	 * Deactivate the dismissable overlay and clean up.
	 */
	deactivate: () => void;
	/**
	 * Update options dynamically.
	 */
	update: (options: Partial<DismissableOptions>) => void;
};

/**
 * Creates a dismissable overlay controller that composes focus trapping,
 * scroll locking, Escape key handling, and outside-click detection.
 *
 * This utility is SSR-safe and manages stacking for nested overlays.
 *
 * @param element - The overlay element (e.g., dialog, div)
 * @param options - Configuration options
 * @returns A controller with activate/deactivate/update methods
 *
 * @example
 * ```ts
 * const dismissable = createDismissable(overlayEl, {
 *   onDismiss: () => { active = false; },
 *   enableEscape: true,
 *   enableOutsideClick: true
 * });
 * dismissable.activate();
 * // later...
 * dismissable.deactivate();
 * ```
 */
export function createDismissable(
	element: HTMLElement,
	options: DismissableOptions
): DismissableController {
	let currentOptions = { ...options };
	let active = false;
	let focusController: FocusScopeController | null = null;
	let removeEscape: (() => void) | null = null;

	// SSR guard
	const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

	function handleOutsideClick(event: MouseEvent) {
		if (!active) return;
		// Check if click target is outside the element
		if (!element.contains(event.target as Node)) {
			event.preventDefault();
			event.stopPropagation();
			currentOptions.onDismiss();
		}
	}

	function activate() {
		if (active) return;
		if (!isBrowser) return;

		active = true;

		// Enable scroll lock
		if (currentOptions.enableScrollLock !== false) {
			lockScroll();
		}

		// Enable focus trap
		if (currentOptions.enableFocusTrap !== false) {
			focusController = createFocusScope(element, currentOptions.initialFocus);
			focusController.activate();
		}

		// Enable Escape key
		if (currentOptions.enableEscape !== false) {
			removeEscape = onEscape(() => {
				currentOptions.onDismiss();
			});
		}

		// Enable outside click
		if (currentOptions.enableOutsideClick !== false) {
			// Use capture phase to intercept clicks before they bubble
			// Delay by microtask to avoid dismissing on the same click that opened the overlay
			setTimeout(() => {
				if (active) {
					document.addEventListener('click', handleOutsideClick, true);
				}
			}, 0);
		}
	}

	function deactivate() {
		if (!active) return;
		if (!isBrowser) return;

		active = false;

		// Cleanup focus trap
		if (focusController) {
			focusController.deactivate();
			focusController = null;
		}

		// Cleanup Escape handler
		if (removeEscape) {
			removeEscape();
			removeEscape = null;
		}

		// Cleanup outside click listener
		if (currentOptions.enableOutsideClick !== false) {
			document.removeEventListener('click', handleOutsideClick, true);
		}

		// Unlock scroll
		if (currentOptions.enableScrollLock !== false) {
			unlockScroll();
		}
	}

	function update(newOptions: Partial<DismissableOptions>) {
		const wasActive = active;
		if (wasActive) deactivate();
		currentOptions = { ...currentOptions, ...newOptions };
		if (wasActive) activate();
	}

	return { activate, deactivate, update };
}

/**
 * Svelte 5 attachment for dismissable overlays.
 *
 * @param options - Configuration for the dismissable behavior
 * @returns An attachment function for use with {@attach ...}
 *
 * @example
 * ```svelte
 * <div {@attach dismissable({ onDismiss: () => { open = false; } })}>
 *   Overlay content
 * </div>
 * ```
 */
export function dismissable(options: DismissableOptions) {
	return (element: HTMLElement) => {
		const controller = createDismissable(element, options);
		controller.activate();

		return () => {
			controller.deactivate();
		};
	};
}
