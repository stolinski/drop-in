# Deprecated in favor of eventually moving to web awesome with a web awesome theme

# @drop-in/decks

Decks is a ui component library that doesn't depend on dependencies or css frameworks to function. They are also deeply committed to using browser standards and APIs before custom JavaScript. Add your own theme, or use `@drop-in/graffiti` to style your decks.

Disclaimer: These are under active development. I encourage you to try them and submit pr's to improve them. I'd like to keep them as opinionated, drop-in style elements, rather than a deep customizable framework.

`npm install @drop-in/decks`

`import { Share } from '@drop-in/decks'`

If you would like css, you can install and import `@drop-in/graffiti`. See https://github.com/stolinski/drop-in/tree/main/packages/graffiti

## Accessibility

- See the repo-wide Accessibility Checklist at `planning/a11y-checklist.md`. This checklist guides roles/ARIA, keyboard support, focus trap/restore, Escape handling and overlay stacking, inert/scroll lock, and reduced-motion behavior across all components.

- Components under development are audited against this checklist; progress is tracked in `planning/phases/phase_1.md`.

## Current Elements

- Menu (Popover based)
- Pills
- Share
- Are You Sure - Confirm Button
- Accordion (Details based)

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

Notes

- Callbacks are post-action notifications; they do not prevent default behavior. To close overlays programmatically, update `bind:active` or call the relevant API on the element (e.g., `dialog.close()`).
- Escape handling and backdrop clicks trigger `oncancel` when enabled.
- Focus trapping and scroll locking are handled internally while overlays are active.
