# Deprecated in favor of eventually moving to web awesome with a web awesome theme

# @drop-in/decks

Decks is a ui component library that doesn't depend on dependencies or css frameworks to function. They are also deeply committed to using browser standards and APIs before custom JavaScript. Add your own theme, or use `@drop-in/graffiti` to style your decks.

Disclaimer: These are under active development. I encourage you to try them and submit pr's to improve them. I'd like to keep them as opinionated, drop-in style elements, rather than a deep customizable framework.

`npm install @drop-in/decks`

## Setup

Import polyfills once in your app's entry point (e.g., root `+layout.svelte` in SvelteKit):

```ts
import '@drop-in/decks/polyfills';
```

This initializes:
- **Popover API** polyfill (@oddbird/popover-polyfill) - For browsers without native `popover` attribute
- **CSS Anchor Positioning** polyfill (@oddbird/css-anchor-positioning) - For browsers without native `anchor-name` / `position-anchor` support

Then import components as needed:

```svelte
import { Dialog, Menu, Toast } from '@drop-in/decks';
```

If you would like css, you can install and import `@drop-in/graffiti`. See https://github.com/stolinski/drop-in/tree/main/packages/graffiti

## Accessibility

- See the repo-wide Accessibility Checklist at `planning/a11y-checklist.md`. This checklist guides roles/ARIA, keyboard support, focus trap/restore, Escape handling and overlay stacking, inert/scroll lock, and reduced-motion behavior across all components.

- Components under development are audited against this checklist; progress is tracked in `planning/phases/phase_1.md`.

## Current Elements

### Components
- Menu (Popover based)
- Pills
- Share
- Are You Sure - Confirm Button
- Accordion (Details based)
- Toggle - Two-state toggle button
- ToggleGroup - View switcher using Toggle
- Tabs - Accessible tab navigation with ARIA support
- Combobox - Autocomplete input with ARIA 1.2 pattern
- Dialog - Modal dialog with focus trap
- Drawer - Slide-out panel with gestures
- Toast - Notification system

### Utilities

**Accessibility Utilities:**
- `createFocusScope` - Focus trapping for overlays
- `onEscape` - Escape key handling with stacking
- `lockScroll`/`unlockScroll` - Background scroll lock
- `createDismissable`/`dismissable` - Dismissable overlay utility (composes focus trap, scroll lock, Escape, outside-click)

**Gesture Utilities:**
- `pannable` - Pan/drag gesture support (touch/mouse/pen unified via Pointer Events)

**Motion Utilities:**
- `motion` - Duration and easing tokens
- `isReducedMotion` - Check prefers-reduced-motion preference
- `durationOrZero` - Return duration or 0 based on motion preference
- `createSpring` - Svelte 5 runes-based spring animation (replaces deprecated svelte/motion spring)

## Overlay Callbacks (Svelte 5 style)

All overlay components use lowercase `on*` callback props instead of dispatching events or camelCase props:

- `Dialog`: `onopen`, `onclose`, `oncancel`, `onconfirm`
- `Drawer`: `onopen`, `onclose`, `oncancel`
- `AreYouSure`: `onconfirm`

Examples

- Dialog

```svelte
<script>
	import Dialog from '@drop-in/decks/Dialog.svelte';
	let open = $state(false);
</script>

<button onclick={() => (open = true)}>Open</button>
<Dialog
	title="Example"
	bind:active={open}
	onopen={() => console.log('dialog open')}
	onclose={() => console.log('dialog close')}
	oncancel={() => console.log('dialog cancel')}
	onconfirm={() => console.log('dialog confirm')}
>
	<form onsubmit={(e) => e.preventDefault()}>
		<!-- form fields -->
		<button type="submit">Submit</button>
	</form>
</Dialog>
```

- Drawer

```svelte
<Drawer
	bind:active={drawerOpen}
	onopen={() => console.log('drawer open')}
	onclose={() => console.log('drawer close')}
	oncancel={() => console.log('drawer cancel')}
>
	<!-- content -->
</Drawer>
```

- AreYouSure

```svelte
<AreYouSure onconfirm={() => doTheThing()} />
```

- Toggle

```svelte
<script>
	import { Toggle } from '@drop-in/decks';
	let view = $state('left');
</script>

<Toggle
	bind:value={view}
	left_label="Grid"
	right_label="List"
	onchange={(value) => console.log('view changed to:', value)}
/>

{#if view === 'left'}
	<!-- Grid view -->
{:else}
	<!-- List view -->
{/if}
```

- ToggleGroup

```svelte
<script>
	import { ToggleGroup } from '@drop-in/decks';
	let view = $state('left');
</script>

<ToggleGroup bind:value={view} left_label="Grid" right_label="List">
	{#snippet left()}
		<div class="grid">
			<!-- Grid view content -->
		</div>
	{/snippet}
	{#snippet right()}
		<div class="list">
			<!-- List view content -->
		</div>
	{/snippet}
</ToggleGroup>
```

## Utilities

Components prioritize native HTML features (e.g., `<dialog>` provides focus trap, Escape, top layer). Utilities only add what native elements don't provide:

### Core utilities

- `lockScroll()` / `unlockScroll()` - Prevent body scroll (native dialog doesn't always lock scroll)
- `onEscape(callback)` - Escape key with stacking (for non-dialog overlays)
- `createFocusScope(element)` - Focus trap (for non-dialog overlays)

### Dismissable (convenience wrapper)

For custom overlays, `createDismissable()` composes the above:

```typescript
import { createDismissable } from '@drop-in/decks';

const controller = createDismissable(element, {
  onDismiss: () => { /* handle dismiss */ },
  enableEscape: true,
  enableOutsideClick: true,
  enableFocusTrap: true,
  enableScrollLock: true
});
controller.activate();
// later: controller.deactivate()
```

**Note:** Dialog uses native `<dialog>` features and only adds scroll lock. Drawer/Menu use these utilities since they don't use `<dialog>`. All overlay components prioritize native browser features (top layer via `<dialog>` or `popover` attribute) over custom JavaScript.

### Pannable (gesture utility)

The `pannable` attachment provides pan/drag gesture support with modern Pointer Events:

```svelte
<script>
  import { pannable } from '@drop-in/decks';

  let x = $state(0);
  let y = $state(0);
  let element = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!element) return;

    function handlePanMove(e: Event) {
      const detail = (e as CustomEvent).detail;
      x += detail.dx;
      y += detail.dy;
    }

    function handlePanEnd(e: Event) {
      const detail = (e as CustomEvent).detail;
      // Check velocity for dismiss gesture
      if (detail.velocityX > 0.5) {
        // Fast swipe - dismiss
      }
    }

    element.addEventListener('panmove', handlePanMove);
    element.addEventListener('panend', handlePanEnd);

    return () => {
      element?.removeEventListener('panmove', handlePanMove);
      element?.removeEventListener('panend', handlePanEnd);
    };
  });
</script>

<div bind:this={element} {@attach pannable} style="transform: translate({x}px, {y}px)">
  Drag me!
</div>
```

**Features:**
- Unified touch/mouse/pen input via Pointer Events API
- Pointer capture for smooth tracking
- Cancellation on scroll or Escape key
- Velocity calculation (X and Y)
- Type-safe event payloads (`PanStartDetail`, `PanMoveDetail`, `PanEndDetail`)

**Events:**
- `panstart` - Pan begins (detail: `{ x, y }`)
- `panmove` - Pan in progress (detail: `{ x, y, dx, dy }`)
- `panend` - Pan completes (detail: `{ x, y, dx, dy, velocityX, velocityY }`)
- `pancancel` - Pan canceled (scroll/escape)

See `Drawer` component for a real-world example using `pannable` for pan-to-dismiss.

Notes

- Callbacks are post-action notifications; they do not prevent default behavior. To close overlays programmatically, update `bind:active` or call the relevant API on the element (e.g., `dialog.close()`).
- Escape handling and backdrop clicks trigger `oncancel` when enabled.
- Focus trapping and scroll locking are handled internally while overlays are active.
- The `dismissable` utility composes `createFocusScope`, `onEscape`, `lockScroll`, and outside-click detection into a single, reusable API for custom overlays.
