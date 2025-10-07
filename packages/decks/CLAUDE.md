# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

@drop-in/decks is a Svelte 5 UI component library focused on web standards, browser APIs, and accessibility. Components are dependency-light (only @oddbird/popover-polyfill and @oddbird/css-anchor-positioning polyfills) and designed to work with or without CSS frameworks. This is a SvelteKit library package within a pnpm workspace monorepo.

## Polyfills

The library includes polyfills for modern browser features:
- **Popover API** (@oddbird/popover-polyfill) - Native `popover` attribute support
- **CSS Anchor Positioning** (@oddbird/css-anchor-positioning) - Native `anchor-name`, `position-anchor`, and `anchor()` function support

Users import once: `import '@drop-in/decks/polyfills';` in their app entry point.

## Commands

This package uses standard npm scripts (not pnpm directly, since it's in a workspace):

- **Dev server**: `npm run dev` - Starts Vite dev server for component development
- **Build**: `npm run build` - Runs `vite build && npm run package` to build and package library
- **Package**: `npm run package` - Runs `svelte-kit sync && svelte-package && publint` to create distributable package
- **Type check**: `npm run check` - Runs svelte-check with TypeScript strict mode
- **Type check (watch)**: `npm run check:watch` - Same as check but in watch mode
- **Lint**: `npm run lint` - Runs Prettier and ESLint checks
- **Format**: `npm run format` - Auto-formats code with Prettier
- **Preview**: `npm run preview` - Preview production build

Note: If working from the monorepo root, prefix commands with `pnpm -F @drop-in/decks` (e.g., `pnpm -F @drop-in/decks dev`).

## Architecture

### Component Structure

- **Overlay components** (Dialog, Drawer, Menu): Use native HTML elements (`<dialog>`) where possible, relying on native browser features first (focus trap, Escape key, top layer). Only add utilities for what native elements don't provide (e.g., scroll lock)
- **Toast system**: Svelte 5 runes-based state management in `toaster.svelte.ts` with `Toast.svelte` container and `ToastSlice.svelte` for individual messages
- **Form components**: AreYouSure (confirmation), Pills/Pill (tag-style inputs)
- **Layout components**: Accordion (uses `<details>`/`<summary>`)

### Accessibility Utilities (`src/lib/a11y/`)

Utilities that add what native HTML doesn't provide:

- **`scrollLock.ts`**: `lockScroll()`/`unlockScroll()` prevent background scrolling when overlays are open (native dialog doesn't reliably lock scroll)
- **`escape.ts`**: `onEscape()` registers Escape key handlers with overlay stacking support (for non-dialog overlays like Drawer, Menu)
- **`focusScope.ts`**: `createFocusScope()` traps focus within a container (for non-dialog overlays; native `<dialog>` provides this automatically)
- **`dismissable.ts`**: `createDismissable()` composes focus/escape/scroll utilities for custom overlays

**Dialog** uses native `<dialog>` focus trap and Escape handling, only adding scroll lock.
**Drawer/Menu** use these utilities since they don't use `<dialog>`.
**All overlay components** prioritize native browser features (top layer via `<dialog>` or `popover` attribute) over custom JavaScript.

### Event Handling Pattern (Svelte 5)

Components use lowercase `on*` callback props (not dispatched events):
- Dialog/Drawer: `onopen`, `onclose`, `oncancel`, `onconfirm`
- AreYouSure: `onconfirm`
- Callbacks are post-action notifications and do not prevent default behavior

### Motion System (`src/lib/motion.ts`)

- `motion` object: Duration/easing tokens for consistent animations
- `isReducedMotion()`: Checks `prefers-reduced-motion`
- `durationOrZero()`: Returns duration or 0 based on motion preference
- All animations must respect reduced motion preferences per a11y checklist

### Module Exports (`src/lib/index.ts`)

Public API uses named exports via barrel file:
- Components: Dialog, Drawer, Menu, Pill, Pills, Share, Accordion, AreYouSure, Toggle, ToggleGroup, Toast (from toast/index.js)
- A11y utilities: createFocusScope, onEscape, lockScroll, unlockScroll, createDismissable, dismissable
- Motion utilities: motion, isReducedMotion, durationOrZero

Secondary export `./docs` provides Docs.svelte component.

### Development Route

`src/routes/+page.svelte` serves as a test/demo page during development. Run `npm run dev` to preview components.

## TypeScript & Code Style

- **Strict mode**: TypeScript strict + svelte-check enforced
- **Module resolution**: NodeNext (ESM with `.js` extensions in relative imports)
- **Imports**: Prefer type-only imports (`import type`) for types; use explicit `.js` extensions for relative imports
- **No any**: Use `unknown` with type narrowing
- **Naming**: Components/types PascalCase, functions/variables camelCase
- **Exports**: Named exports only (no default exports)
- **Error handling**: Throw `Error` with clear messages; no `console.*` in library code

## Accessibility Requirements

All components must pass the checklist in `planning/a11y-checklist.md`:
- Correct ARIA roles, states, and relationships
- Full keyboard navigation (Tab, Shift+Tab, Enter, Space, Escape, arrows where applicable)
- Focus trap and restore for overlays
- Escape handling with proper stacking (topmost overlay responds)
- Background isolation (inert/aria-hidden) and scroll lock
- Reduced motion support for all animations

## Build Output

- Package is built to `dist/` via svelte-package
- Exports defined in package.json for main library and docs entry points
- Build runs vite build first, then npm run package (which includes publint validation)

## Related Documentation

- Accessibility checklist: `planning/a11y-checklist.md`
- Phase planning: `planning/phases/`
- Roadmap: `planning/roadmap.md`
- Main README: `README.md` (covers current components and usage examples)
