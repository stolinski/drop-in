# Decks UI — Roadmap

> Language: en-US | Tone: product-technical, concise
> Guidance: this is a repo css agnostic svelte5 ui components where css should be only functional and not presentational, we need to improve the existing componets and complete to include many otehrs as well as have working docs (../docs) compoents need to be full acceessible, smooth, animated and exteremly easy and low effort api

## Goals

- Ship a cohesive, CSS-agnostic Svelte 5 component set with functional-only styles.
- Ensure first-class accessibility, smooth micro-animations, and tiny, low-effort APIs.
- Provide working docs site with live examples and recipes.
- Expand coverage to common UI primitives and app patterns.

## Scope

- Components live in `src/lib`; docs live under `../docs` (separate package).
- No presentational CSS; expose slots, states, and tokens for styling.
- Prefer small, focused props over complex configuration objects.

## Principles

- Accessibility first: keyboard, ARIA, focus management, reduced-motion support.
- Smooth by default: subtle transitions with sensible motion preferences.
- Composable: headless core + optional opinionated wrappers.
- Portable: minimal dependencies; SSR-safe; zero- or tiny-runtime.

## Phases

### Phase 1 — Stabilize Core + A11y

- Audit existing components: `Accordion`, `Dialog`, `Drawer`, `Menu`, `Pill(s)`, `Share`, `AreYouSure`, `Toast`.
- Establish a11y checklist (roles, aria-\*\*, focus trap/restore, escape/stacking, inert/scroll lock).
- Normalize state APIs: controlled/uncontrolled, events naming, rune usage.
- Motion baseline: open/close transitions, reduced motion fallbacks.
- Docs bootstrap: minimal examples per component; usage + a11y notes.

### Phase 2 — Expand Primitives

- Add missing core primitives: `Tooltip`, `Popover`, `Tabs`, `Disclosure`, `Combobox`, `Select`, `Dropdown`, `Progress`, `Slider`.
- Utilities: focus ring helper, `pannable` refinements, dismissable overlays, portal.
- Form patterns: field, label, description, error, helper text patterns.
- Accessibility verification with automated checks in examples.

### Phase 3 — Docs & Examples

- Build live docs with sandboxed examples; embed minimal CSS utilities.
- Provide recipes: dialogs within drawers, nested menus, toasts from actions.
- Usage guidance: theming via data-attributes, CSS vars, state-driven classes.
- Copy-paste snippets and StackBlitz/REPL links.

### Phase 4 — Polish & DX

- API ergonomics pass: prop names, defaults, slot props, events.
- Performance: SSR safety, tree-shaking, bundle size checks.
- Animation polish: spring/tween presets, interruption handling, focus-animate.
- Testing strategy for interactions and accessibility smoke tests.

### Phase 5 — Ecosystem & Releases

- Versioning policy and changelog discipline.
- Starter templates and migration notes.
- Contribution guides, issue templates, and component request process.

Active Phase: [Phase 1 — Stabilize Core + A11y](./phases/phase_1.md)
