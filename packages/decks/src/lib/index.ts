// Reexport your entry components here
export { default as Dialog } from './Dialog.svelte';
export { default as Drawer } from './Drawer.svelte';
export { default as Menu } from './Menu.svelte';
export { default as Pill } from './Pill.svelte';
export { default as Pills } from './Pills.svelte';
export { default as Share } from './Share.svelte';
export { default as Accordion } from './Accordion.svelte';
export { default as AreYouSure } from './AreYouSure.svelte';
export { default as Toggle } from './Toggle.svelte';
export { default as ToggleGroup } from './ToggleGroup.svelte';
export * from './toast/index.js';

// a11y utilities
export { createFocusScope } from './a11y/focusScope.js';
export { onEscape } from './a11y/escape.js';
export { lockScroll, unlockScroll } from './a11y/scrollLock.js';
export { createDismissable, dismissable } from './a11y/dismissable.js';
export type { DismissableOptions, DismissableController } from './a11y/dismissable.js';

// motion utilities and tokens
export { motion, isReducedMotion, durationOrZero } from './motion.js';
