# Tabs Component Implementation

## Overview

A fully accessible, native-first Tabs component for Svelte 5 following the WAI-ARIA Tabs pattern.

## Features Implemented

### ✅ Accessibility (ARIA)
- **Roving tabindex**: Only one tab is focusable at a time (active tab has `tabindex="0"`, others have `tabindex="-1"`)
- **Arrow key navigation**:
  - Horizontal orientation: Left/Right arrows
  - Vertical orientation: Up/Down arrows
- **Home/End keys**: Jump to first/last tab
- **Full ARIA support**:
  - `role="tablist"` on TabList
  - `role="tab"` on Tab buttons
  - `role="tabpanel"` on TabPanel
  - `aria-selected="true"` on active tab
  - `aria-controls` linking tabs to panels
  - `aria-labelledby` linking panels to tabs
  - `aria-orientation` for screen readers

### ✅ State Management
- **Controlled mode**: Use `bind:value` for external state control
- **Uncontrolled mode**: Automatically initializes to first tab
- **Change callback**: `onchange` prop for side effects

### ✅ Features
- **Animated indicator**: CSS-based sliding indicator with smooth transitions
- **Reduced motion support**: Respects `prefers-reduced-motion` media query
- **SSR-safe**: All browser APIs properly guarded
- **Orientation support**: Horizontal (default) or vertical layouts
- **Disabled tabs**: Support for disabled state on individual tabs
- **Focus retention**: Focus moves with tab selection

### ✅ Svelte 5 Patterns
- Uses runes: `$state`, `$derived`, `$effect`, `$bindable`, `$props`
- Uses snippets for children (not traditional slots)
- Uses context API for component communication
- Lowercase callback props (`onchange`, not `onChange`)

## Component Structure

```svelte
<Tabs bind:value={activeTab} orientation="horizontal" onchange={(tab) => {}}>
  <TabList>
    <Tab value="tab1">Tab 1</Tab>
    <Tab value="tab2">Tab 2</Tab>
  </TabList>

  <TabPanel value="tab1">
    Panel 1 content
  </TabPanel>
  <TabPanel value="tab2">
    Panel 2 content
  </TabPanel>
</Tabs>
```

## Files Created

1. **`src/lib/Tabs.svelte`** - Container component managing state and keyboard navigation
2. **`src/lib/TabList.svelte`** - Wrapper for tab buttons with animated indicator
3. **`src/lib/Tab.svelte`** - Individual tab button with ARIA attributes
4. **`src/lib/TabPanel.svelte`** - Content panel for each tab
5. **Updated `src/lib/index.ts`** - Exports all Tabs components
6. **Updated `src/lib/local/Docs.svelte`** - Added documentation and example

## Usage Example

```svelte
<script>
  import { Tabs, TabList, Tab, TabPanel } from '@drop-in/decks';
  let activeTab = $state('profile');
</script>

<Tabs bind:value={activeTab}>
  <TabList>
    <Tab value="profile">Profile</Tab>
    <Tab value="settings">Settings</Tab>
    <Tab value="notifications">Notifications</Tab>
  </TabList>

  <TabPanel value="profile">
    <h3>Profile</h3>
    <p>Your profile information...</p>
  </TabPanel>

  <TabPanel value="settings">
    <h3>Settings</h3>
    <p>Configure your settings...</p>
  </TabPanel>

  <TabPanel value="notifications">
    <h3>Notifications</h3>
    <p>Manage notifications...</p>
  </TabPanel>
</Tabs>
```

## Styling

The component uses CSS variables for theming:

```css
--di-tab-color: #64748b              /* Inactive tab text color */
--di-tab-hover-color: #334155        /* Hover state color */
--di-tab-active-color: #3b82f6       /* Active tab color */
--di-tab-focus-color: #3b82f6        /* Focus outline color */
--di-tab-border-color: #e5e5e5       /* TabList border color */
--di-tab-indicator-color: #3b82f6    /* Animated indicator color */
--di-motion-duration: 200ms          /* Animation duration */
--di-motion-ease-out: cubic-bezier() /* Animation easing */
```

## Keyboard Navigation

- **Tab**: Move focus into/out of tablist
- **Left/Right Arrow** (horizontal): Navigate between tabs
- **Up/Down Arrow** (vertical): Navigate between tabs
- **Home**: Jump to first tab
- **End**: Jump to last tab
- **Enter/Space**: Activate focused tab (handled by native button)

## Type Check Results

✅ 0 errors, 3 warnings (all pre-existing CSS warnings)

## Browser Compatibility

- Modern browsers with ES6+ support
- SSR-compatible (SvelteKit)
- Works without JavaScript (tabs render, but navigation requires JS)

## Accessibility Compliance

Follows WAI-ARIA Authoring Practices for Tabs:
- https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

## Next Steps

Consider adding:
- [ ] Automatic tab activation on focus (vs. manual activation)
- [ ] Tab deletion/close functionality
- [ ] Keyboard shortcuts (e.g., Ctrl+Tab to cycle)
- [ ] Lazy loading of tab panels
- [ ] Tab overflow handling (horizontal scrolling/dropdown)
