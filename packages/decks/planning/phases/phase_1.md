# Phase 1 — Stabilize Core + A11y

Phase 1 focuses on stabilizing the core component set with accessibility-first behavior, consistent and tiny APIs, smooth default motion with reduced-motion fallbacks, and bootstrapping minimal docs for current components. The emphasis is on auditing existing components, establishing an a11y checklist, normalizing state/event patterns, and shipping baseline examples.

## Active Tasks

| ID    | Task                                                | Priority | Status  | Notes / Acceptance Criteria                                                                                                                                                                            |
| ----- | --------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

| p1-8  | Bring Menu to Phase 1 standard                      | M        | pending | Menu supports full keyboard navigation arrow keys, roles/aria, proper focus management, normalized events, motion baseline, and an example demonstrating nested items.                                 |
| p1-9  | Bring Accordion to Phase 1 standard                 | L        | pending | Accordion uses proper button/region semantics, ARIA attributes, keyboard toggling, normalized state/events, motion baseline, and an example of single/multiple expand modes.                           |
| p1-10 | Bring Pill/Pills to Phase 1 standard                | L        | pending | Pill and Pills expose headless state, proper roles/labels, normalized events, and examples for selectable/removable variants.                                                                          |
| p1-11 | Bring Share and AreYouSure to Phase 1 standard      | L        | pending | Components pass the a11y checklist, use normalized state/events, have motion where applicable, and include minimal usage examples.                                                                     |
| p1-13 | Ensure Toast complies with a11y expectations        | M        | pending | Toast uses appropriate role/aria-live, is dismissible via keyboard, does not steal focus, supports pause-on-hover, and follows normalized events/state. An example demonstrates stacking and timeouts. |
| p1-14 | Finalize events naming schema and map per component | M        | blocked | A consistent event naming scheme (e.g., open/change/close with detail shape) is approved and documented, and a mapping exists for each component. Blocked on p1-3 conventions approval.                |

## Completed ✓

| ID    | Task                                                   | Completed  |
| ----- | ------------------------------------------------------ | ---------- |
| p1-1  | Establish repository-wide a11y checklist               | 2025-09-28 |
| p1-2  | Audit existing components against a11y checklist       | 2025-09-28 |
| p1-3  | Normalize state APIs and events conventions            | 2025-09-29 |
| p1-4  | Integrate focus/escape/scroll-lock into overlays       | 2025-09-29 |
| p1-5  | Define motion baseline with reduced-motion support     | 2025-09-29 |
| p1-6  | Bring Dialog to Phase 1 standard                       | 2025-09-29 |
| p1-7  | Bring Drawer to Phase 1 standard                       | 2025-09-29 |
| p1-12 | Bootstrap minimal docs/examples for current components | 2025-09-29 |

## Conventions — State & Events (p1-3)

These conventions apply to interactive components, with overlays (Dialog, Drawer, Menu) as the primary reference. Dialog is the reference implementation.

- State: active
  - Type: boolean; default `false`; marked `$bindable(false)` for controlled/uncontrolled usage.
  - Behavior: when `active` transitions false→true the component opens; true→false closes.
- Callbacks: onopen/onclose/oncancel/onconfirm
  - Props: `onopen?: () => void; onclose?: () => void; oncancel?: () => void; onconfirm?: () => void`.
  - Semantics:
    - onopen: called once when the component opens.
    - onclose: called when the component finishes closing (including after cancel/confirm flows).
    - oncancel: called when user dismisses without confirming (e.g., Esc, backdrop click, close button).
    - onconfirm: called when user positively confirms.
  - Note: For components without a confirm path, only implement onopen/onclose (and oncancel where applicable).
- No legacy on\_\* props
  - Do not expose `on_cancel`, `on_confirm`, etc. Prefer Svelte 5 callback props `onopen`/`onclose`/`oncancel`/`onconfirm`.
- Rune usage
  - Public state uses `$bindable` (e.g., `active = $bindable(false)`).
  - Internal ephemeral values use `$state`; derived booleans via `$derived`.
  - Side effects and DOM wiring use `$effect` with proper cleanup.
- Defaults
  - Provide small, sensible defaults for labels/text where applicable (e.g., “Cancel”, “Ok”).
- Notes for p1-14
  - Event detail payloads and formal event naming taxonomy will be finalized under p1-14; until then, the zero-argument callback props above are the canonical surface.
