/**
 * Polyfill initialization for @drop-in/decks
 *
 * This file initializes browser feature polyfills:
 * - Popover API (@oddbird/popover-polyfill)
 * - CSS Anchor Positioning (@oddbird/css-anchor-positioning)
 *
 * Import this once in your app's entry point or root layout:
 * ```ts
 * import '@drop-in/decks/polyfills';
 * ```
 */

if (typeof window !== 'undefined') {
	// Popover API polyfill
	import('@oddbird/popover-polyfill');

	// CSS Anchor Positioning polyfill
	// Provides support for anchor-name, position-anchor, and anchor() function
	import('@oddbird/css-anchor-positioning/fn');
}
