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
