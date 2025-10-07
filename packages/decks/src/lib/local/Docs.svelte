<script lang="ts">
	import '@drop-in/graffiti';
	import Accordion from '$lib/Accordion.svelte';
	import AreYouSure from '$lib/AreYouSure.svelte';
	import Menu from '$lib/Menu.svelte';
	import Share from '$lib/Share.svelte';
	import { Toast, toaster } from '../toast/index.js';
	import Dialog from '$lib/Dialog.svelte';
	import Drawer from '$lib/Drawer.svelte';
	import Pill from '$lib/Pill.svelte';
	import Pills from '$lib/Pills.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import TabList from '$lib/TabList.svelte';
	import Tab from '$lib/Tab.svelte';
	import TabPanel from '$lib/TabPanel.svelte';

	let drawer_open = $state(false);
	let dialog_open = $state(false);
	let toggle_value = $state<'left' | 'right'>('left');
	let toggle_group_value = $state<'left' | 'right'>('left');
	let active_tab = $state('tab1');
</script>

<div class="layout">
	<div class="content">
		<h1>@drop-in/decks 🛹</h1>
		<div class="sub">
			<div class="content fc">
				<p>
					Decks is a ui component library that doesn't depend on dependencies or css frameworks to
					function. They are also deeply committed to using browser standards and APIs before custom
					JavaScript. Add your own theme, or use `@drop-in/graffiti` to style your decks.
				</p>
			</div>
			<div class="content fc">
				<p>
					Disclaimer: These are under active development. I encourage you to try them and submit
					pr's to improve them. I'd like to keep them as opinionated, drop-in style elements, rather
					than a deep customizable framework.
				</p>
				<p>
					Accessibility: See the repo-wide checklist at <code>planning/a11y-checklist.md</code> and
					Phase 1 tasks in <code>planning/phases/phase_1.md</code>.
				</p>

				<div class="row">
					<h2 class="fs-l">Accordion</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>summary</code> (string, required), <code>children</code>
						(snippet, required). Uses native <code>&lt;details&gt;</code> with smooth animation.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Enter/Space to toggle. Screen readers announce
						expanded/collapsed state via native <code>&lt;details&gt;</code> semantics.
					</p>
					<Accordion summary="Click to expand">
						<p>Hidden content</p>
					</Accordion>
				</div>

				<div class="row">
					<h2 class="fs-l">Menu</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>button</code> (snippet, required), <code>name</code>
						(string, required), <code>vert</code> (boolean, default: false), <code>horizontal</code>
						(boolean, default: false), <code>modal</code> (boolean, default: false),
						<code>disable_escape</code>
						(boolean, default: false). Popover-based menu with positioning options.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Enter/Space to open, Escape to close (unless disabled),
						Tab/Shift+Tab to navigate items. Uses native <code>&lt;dialog popover&gt;</code> for focus
						management.
					</p>
					<Menu name="menu">
						{#snippet button()}
							Menu
						{/snippet}
						<button>Click me</button>
					</Menu>
				</div>

				<div class="row">
					<h2 class="fs-l">Pill & Pills</h2>
					<p class="api-summary">
						<strong>Pill API:</strong> <code>children</code> (snippet, required), <code>link</code>
						(string, optional), <code>onclick</code> (function, optional). Renders as
						<code>&lt;a&gt;</code>, <code>&lt;button&gt;</code>, or <code>&lt;span&gt;</code> based on
						props.
					</p>
					<p class="api-summary">
						<strong>Pills API:</strong> <code>content</code> (array of strings or objects with text/link,
						required). Convenience wrapper for rendering multiple Pills.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Standard link/button keyboard semantics. Links navigable via Tab,
						buttons via Enter/Space.
					</p>
					<div style="display: flex; gap: 8px; flex-wrap: wrap;">
						<Pill>Plain Pill</Pill>
						<Pill link="/somewhere">Link Pill</Pill>
						<Pill onclick={() => alert('Clicked!')}>Button Pill</Pill>
					</div>
					<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
						<Pills content={['Tag 1', 'Tag 2', 'Tag 3']} />
					</div>
					<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
						<Pills
							content={[
								{ text: 'Docs', link: '/docs' },
								{ text: 'Examples', link: '/examples' }
							]}
						/>
					</div>
				</div>

				<div class="row">
					<h2 class="fs-l">Dialog</h2>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Tab/Shift+Tab to navigate, Escape to close, Enter/Space to activate
						buttons. Focus is trapped within the dialog and restored on close.
					</p>
					<Dialog title="This is a fake form" show_button={true}>
						<form onsubmit={(e) => e.preventDefault()}>
							<label for="name1">Name</label>
							<input id="name1" name="name1" type="text" />
							<button type="submit">Submit</button>
						</form>
					</Dialog>
					<button type="button" onclick={() => (dialog_open = true)}
						>Dialog show_button false</button
					>
					<Dialog title="This is a fake form" show_button={false} bind:active={dialog_open}>
						<form onsubmit={(e) => e.preventDefault()}>
							<label for="email1">Email</label>
							<input id="email1" name="email1" type="email" />
							<button type="button" onclick={() => (dialog_open = false)}>Close</button>
						</form>
					</Dialog>
				</div>

				<div class="row">
					<h2 class="fs-l">Drawer</h2>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Tab/Shift+Tab to navigate, Escape to close (unless disabled),
						Enter/Space to activate buttons. Focus is trapped within the drawer and restored on close.
						Supports swipe/drag gestures.
					</p>
					<button type="button" onclick={() => (drawer_open = true)}
						>Open Drawer from Outside</button
					>
					<Drawer
						show_button={true}
						button_text="Open Drawer"
						bind:active={drawer_open}
						onopen={() => console.log('open')}
						onclose={() => console.log('close')}
						oncancel={() => console.log('cancel')}
					>
						<form action="">
							<input type="text" name="name" />
							<input type="email" name="email" />
							<button type="submit">Submit</button>
						</form>
						<button type="button" onclick={() => (drawer_open = false)}
							>Close from outside Drawer</button
						>
					</Drawer>
				</div>

				<div class="row">
					<h2 class="fs-l">Are you sure? - Confirmation Button</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>attempts</code> (number, default: 3), <code>text</code>
						(string, default: 'Delete'), <code>onconfirm</code> (function, required),
						<code>action_class</code>
						(string, optional). Progressive confirmation requiring multiple clicks.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Enter/Space to trigger clicks. Visual progress indicator shows
						remaining attempts. Resets after timeout.
					</p>
					<AreYouSure onconfirm={() => alert('Doing whatever')} />
				</div>

				<div class="row">
					<h2 class="fs-l">Toggle</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>bind:value</code> ('left' | 'right', bindable),
						<code>left_label</code>
						(string, default: 'Left'), <code>right_label</code> (string, default: 'Right'),
						<code>onchange</code>
						(function, optional). Two-state toggle button for view switching.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Enter/Space to activate, Tab to focus. Uses
						<code>aria-pressed</code> for state announcement and proper focus indicators.
					</p>
					<Toggle
						bind:value={toggle_value}
						left_label="Grid View"
						right_label="List View"
						onchange={(value) => console.log('Toggle changed to:', value)}
					/>
					<p style="margin-top: 12px;">Current value: <strong>{toggle_value}</strong></p>
				</div>

				<div class="row">
					<h2 class="fs-l">ToggleGroup</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>bind:value</code> ('left' | 'right', bindable),
						<code>left_label</code>
						(string, default: 'Left'), <code>right_label</code> (string, default: 'Right'),
						<code>left</code>
						(snippet, required), <code>right</code> (snippet, required), <code>onchange</code>
						(function, optional). Combines Toggle with view switching.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Same as Toggle. Content changes based on selection.
					</p>
					<ToggleGroup
						bind:value={toggle_group_value}
						left_label="Card View"
						right_label="Table View"
					>
						{#snippet left()}
							<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
								<div
									style="border: 1px solid var(--c-border, #ccc); padding: 12px; border-radius: 6px;"
								>
									Card 1
								</div>
								<div
									style="border: 1px solid var(--c-border, #ccc); padding: 12px; border-radius: 6px;"
								>
									Card 2
								</div>
								<div
									style="border: 1px solid var(--c-border, #ccc); padding: 12px; border-radius: 6px;"
								>
									Card 3
								</div>
							</div>
						{/snippet}
						{#snippet right()}
							<table style="width: 100%; border-collapse: collapse;">
								<thead>
									<tr>
										<th
											style="border: 1px solid var(--c-border, #ccc); padding: 8px; text-align: left;"
											>Name</th
										>
										<th
											style="border: 1px solid var(--c-border, #ccc); padding: 8px; text-align: left;"
											>Status</th
										>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td style="border: 1px solid var(--c-border, #ccc); padding: 8px;">Item 1</td>
										<td style="border: 1px solid var(--c-border, #ccc); padding: 8px;">Active</td>
									</tr>
									<tr>
										<td style="border: 1px solid var(--c-border, #ccc); padding: 8px;">Item 2</td>
										<td style="border: 1px solid var(--c-border, #ccc); padding: 8px;">Pending</td>
									</tr>
								</tbody>
							</table>
						{/snippet}
					</ToggleGroup>
				</div>

				<div class="row">
					<h2 class="fs-l">Tabs</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>bind:value</code> (string, bindable),
						<code>orientation</code>
						('horizontal' | 'vertical', default: 'horizontal'), <code>onchange</code>
						(function, optional). Tab components use <code>TabList</code> for the tab buttons,
						<code>Tab</code>
						for individual tabs, and <code>TabPanel</code> for content.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Left/Right arrows (horizontal) or Up/Down arrows (vertical)
						to navigate tabs, Home/End to jump to first/last tab, Tab to move focus out of tablist.
						Uses roving tabindex (only active tab is focusable). Full ARIA support with
						<code>role="tab"</code>, <code>role="tablist"</code>, <code>role="tabpanel"</code>,
						<code>aria-selected</code>, and <code>aria-controls</code>.
					</p>
					<Tabs bind:value={active_tab} orientation="horizontal">
						<TabList>
							<Tab value="tab1">Profile</Tab>
							<Tab value="tab2">Settings</Tab>
							<Tab value="tab3">Notifications</Tab>
							<Tab value="tab4" disabled>Disabled</Tab>
						</TabList>
						<TabPanel value="tab1">
							<h3>Profile</h3>
							<p>Manage your profile information and preferences.</p>
						</TabPanel>
						<TabPanel value="tab2">
							<h3>Settings</h3>
							<p>Configure your account settings and privacy options.</p>
						</TabPanel>
						<TabPanel value="tab3">
							<h3>Notifications</h3>
							<p>Control how and when you receive notifications.</p>
						</TabPanel>
						<TabPanel value="tab4">
							<h3>Disabled</h3>
							<p>This tab is disabled and cannot be selected.</p>
						</TabPanel>
					</Tabs>
					<p style="margin-top: 12px;">Current tab: <strong>{active_tab}</strong></p>
				</div>

				<div class="row">
					<h2 class="fs-l">Share</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>url</code> (string, optional), <code>title</code>
						(string, optional), <code>text</code> (string, optional), <code>twitter_account</code>
						(string, optional), <code>after_copy</code> (function, optional),
						<code>show_button</code>
						(boolean, default: true). Uses Web Share API with clipboard fallback.
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Enter/Space to trigger share. Falls back to clipboard copy if
						Web Share API unavailable. Provides feedback via <code>after_copy</code> callback.
					</p>
					<Share
						show_button={true}
						url="https://svelte.dev"
						title="Svelte"
						text="Check out Svelte"
						twitter_account="sveltejs"
						after_copy={() => {}}
					/>
				</div>

				<div class="row">
					<h2 class="fs-l">Toast</h2>
					<p class="api-summary">
						<strong>API:</strong> <code>position</code> (object: inline/block, default: end/end),
						<code>offset</code> (object: inline/block, default: 20px/20px). Use
						<code>toaster.send(message, options)</code>
						to display. Options: <code>type</code> ('SUCCESS' | 'ERROR' | 'WARNING'),
						<code>duration</code>
						(ms, default: 3000).
					</p>
					<p class="a11y-note">
						<strong>Keyboard:</strong> Escape to dismiss active toast. Auto-dismisses after duration.
						Uses ARIA live region for screen reader announcements.
					</p>

					<button type="button" onclick={() => toaster.send('Hi from toast')}>Click me</button>
					<button type="button" onclick={() => toaster.send('Hi from toast', { type: 'SUCCESS' })}
						>Success</button
					>
					<button type="button" onclick={() => toaster.send('Hi from toast', { type: 'ERROR' })}
						>Error</button
					>
					<button type="button" onclick={() => toaster.send('Hi from toast', { type: 'WARNING' })}
						>Warning</button
					>
				</div>
			</div>
		</div>
	</div>
</div>

<Toast position={{ inline: 'end', block: 'end' }} offset={{ inline: '20px', block: '20px' }} />

<style>
	.a11y-note {
		font-size: 0.875rem;
		color: var(--c-text-secondary, #666);
		margin: 8px 0;
	}

	.api-summary {
		font-size: 0.875rem;
		margin: 8px 0;
	}
</style>
