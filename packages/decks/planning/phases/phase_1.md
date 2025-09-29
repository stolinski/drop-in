# Phase 1 — Stabilize Core + A11y

Phase 1 focuses on stabilizing the core component set with accessibility-first behavior, consistent and tiny APIs, smooth default motion with reduced-motion fallbacks, and bootstrapping minimal docs for current components. The emphasis is on auditing existing components, establishing an a11y checklist, normalizing state/event patterns, and shipping baseline examples.

## Active Tasks

| ID  | Title | Priority | Status | Acceptance Criteria |
| --- | ----- | -------- | ------ | ------------------- |

| p1-3 | Normalize state APIs and events conventions | H | pending | A conventions doc defines controlled/uncontrolled patterns, default values, event names/signatures, and rune usage. At least one component (Dialog) is updated to conform, serving as the reference implementation. |
| p1-4 | Integrate focus/escape/scroll-lock into overlays | M | pending | Dialog, Drawer, and Menu use focus trapping, restore focus on close, close on Escape, prevent background scroll, and maintain correct stacking with multiple overlays. Manual tests confirm behavior across these components. |
| p1-5 | Define motion baseline with reduced-motion support | M | pending | Open/close transitions are implemented for core interactive components; all motion respects prefers-reduced-motion with appropriate fallbacks. Tokens/props for timing/easing are documented. |
| p1-6 | Bring Dialog to Phase 1 standard | M | pending | Dialog passes the a11y checklist, adopts normalized state/events, implements motion baseline, and includes examples demonstrating keyboard navigation and focus management. |
| p1-7 | Bring Drawer to Phase 1 standard | M | pending | Drawer passes the a11y checklist, adopts normalized state/events, implements motion baseline, and includes examples showing focus lock and escape-to-close. |
| p1-8 | Bring Menu to Phase 1 standard | M | pending | Menu supports full keyboard navigation (arrow keys, typeahead if applicable), roles/aria, proper focus management, normalized events, motion baseline, and an example demonstrating nested items. |
| p1-9 | Bring Accordion to Phase 1 standard | L | pending | Accordion uses proper button/region semantics, ARIA attributes, keyboard toggling, normalized state/events, motion baseline, and an example of single/multiple expand modes. |
| p1-10 | Bring Pill/Pills to Phase 1 standard | L | pending | Pill and Pills expose headless state, proper roles/labels, normalized events, and examples for selectable/removable variants. |
| p1-11 | Bring Share and AreYouSure to Phase 1 standard | L | pending | Components pass the a11y checklist, use normalized state/events, have motion where applicable, and include minimal usage examples. |
| p1-12 | Bootstrap minimal docs/examples for current components | H | pending | Each listed component has a minimal usage example with a11y notes and API summary. Examples are runnable locally and linked from the docs entry point. |
| p1-13 | Ensure Toast complies with a11y expectations | M | pending | Toast uses appropriate role/aria-live, is dismissible via keyboard, does not steal focus, supports pause-on-hover, and follows normalized events/state. An example demonstrates stacking and timeouts. |
| p1-14 | Finalize events naming schema and map per component | M | blocked | A consistent event naming scheme (e.g., open/change/close with detail shape) is approved and documented, and a mapping exists for each component. Blocked on p1-3 conventions approval. |

## Completed ✓

| ID   | Title                                            | Completed  |
| ---- | ------------------------------------------------ | ---------- |
| p1-1 | Establish repository-wide a11y checklist         | 2025-09-28 |
| p1-2 | Audit existing components against a11y checklist | 2025-09-28 |

## Conventions — State & Events (p1-3)

These conventions apply to interactive components, with overlays (Dialog, Drawer, Menu) as the primary reference. Dialog is the reference implementation.

- State: active
  - Type: boolean; default `false`; marked `$bindable(false)` for controlled/uncontrolled usage.
  - Behavior: when `active` transitions false→true the component opens; true→false closes.
- Callbacks: open/close/cancel/confirm
  - Props: `open?: () => void; close?: () => void; cancel?: () => void; confirm?: () => void`.
  - Semantics:
    - open: called once when the component opens.
    - close: called when the component finishes closing (including after cancel/confirm flows).
    - cancel: called when user dismisses without confirming (e.g., Esc, backdrop click, close button).
    - confirm: called when user positively confirms.
  - Note: For components without a confirm path, only implement open/close (and cancel where applicable).
- No legacy on\_\* props
  - Do not expose `on_cancel`, `on_confirm`, etc. Prefer the standardized callback props above.
- Rune usage
  - Public state uses `$bindable` (e.g., `active = $bindable(false)`).
  - Internal ephemeral values use `$state`; derived booleans via `$derived`.
  - Side effects and DOM wiring use `$effect` with proper cleanup.
- Defaults
  - Provide small, sensible defaults for labels/text where applicable (e.g., “Cancel”, “Ok”).
- Notes for p1-14
  - Event detail payloads and formal event naming taxonomy will be finalized under p1-14; until then, the zero-argument callback props above are the canonical surface.
