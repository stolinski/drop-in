# Accessibility Checklist (Repo-Wide)

Use this checklist to evaluate and implement accessibility for all components in @drop-in/decks. Apply it when building new components and when auditing existing ones.

How to use

- For each component, verify every item and record Pass/Fail with notes.
- If an item is not applicable, mark N/A and briefly explain why.
- Link remediation tasks back to the component issue or planning note.

## Roles and ARIA

- [ ] Correct role is applied (e.g., `dialog`, `menu`, `menuitem`, `button`, `region`).
- [ ] Component has an accessible name via visible label or `aria-label` / `aria-labelledby`.
- [ ] State attributes reflect UI state (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-hidden`).
- [ ] For dialogs/overlays, `aria-modal="true"` (or equivalent semantics) is used where appropriate.
- [ ] Relationships are wired (e.g., trigger `aria-controls` points to content ID).

## Keyboard Support

- [ ] Tabbing reaches all interactive elements in a logical order; Shift+Tab reverses correctly.
- [ ] Activation keys work: Enter/Space on buttons/controls; Space toggles checkable elements.
- [ ] Escape closes dismissible overlays (Dialog, Drawer, Menu, etc.). Topmost overlay handles Escape.
- [ ] Arrow-key navigation for composite widgets (e.g., Menu, roving tabindex, Home/End where applicable).
- [ ] Focus visibly moves with keyboard; no keyboard trap or dead ends.

## Focus Management (Trap + Restore)

- [ ] On open, initial focus is set to a meaningful element (e.g., first focusable or the dialog itself).
- [ ] Focus is trapped within overlays while open (no escape to background content via Tab).
- [ ] On close, focus is restored to the element that opened the overlay (or a safe fallback).
- [ ] Portaled content maintains correct focus order using sentinels or scope utilities as needed.

## Escape Handling and Overlay Stacking

- [ ] Only the topmost overlay responds to Escape; underlying overlays ignore it.
- [ ] Clicking the backdrop follows the component’s close policy (configurable when appropriate).
- [ ] Z-index/stacking is consistent across overlays; layering does not break focus/interaction.

## Inert/Background Isolation and Scroll Lock

- [ ] Background content is isolated while overlays are open (use `inert` where supported or `aria-hidden` strategy).
- [ ] Background scroll is prevented while overlays are open; restored on close.
- [ ] Scroll locking does not cause layout shift; compensations (e.g., scrollbar gap) are applied if needed.

## Motion and Reduced Motion

- [ ] Open/close and other animations respect `prefers-reduced-motion`.
- [ ] Provide non-animated or minimized-motion fallbacks when reduced motion is requested.
- [ ] Timings/easing are consistent with project tokens and documented knobs/props.

## Live Regions and Announcements (where applicable)

- [ ] Toasts/notifications use appropriate roles (`role="status"` for polite, `role="alert"` for assertive) and do not steal focus.
- [ ] Timeouts are long enough to be read or content is persistent until user dismissal.
- [ ] Announcements avoid repetition and are updated meaningfully (changes announced once).

## Documentation and Testing Hooks

- [ ] Public API documents how to control state and listen to events without requiring mouse.
- [ ] Examples demonstrate keyboard navigation and focus behavior.
- [ ] Add test IDs or stable selectors only if necessary for testing; do not leak implementation details in the API.

References

- WAI-ARIA Authoring Practices (APG)
- MDN Web Docs for roles, attributes, and interaction patterns
- Inclusive Components guidance

Notes

- Use helpers from `$lib/a11y` (`createFocusScope`, `onEscape`, `lockScroll`/`unlockScroll`) where appropriate.
- Avoid console logs in library code; throw clear errors or return typed results.
