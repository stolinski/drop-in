<script lang="ts">
	import Docs from '$lib/local/Docs.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';

	let demo_view = $state<'left' | 'right'>('left');
</script>

<Docs />

<div style="margin: 40px 20px; padding: 20px; border: 2px dashed var(--c-border, #ccc); border-radius: 8px;">
	<h2 style="margin-top: 0;">ToggleGroup Demo</h2>
	<ToggleGroup bind:value={demo_view} left_label="Grid Layout" right_label="List Layout">
		{#snippet left()}
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
				{#each Array(6) as _, i}
					<div
						style="background: var(--c-bg-secondary, #f5f5f5); padding: 20px; border-radius: 8px; text-align: center;"
					>
						<strong>Item {i + 1}</strong>
						<p style="margin: 8px 0 0 0; font-size: 0.9em; color: var(--c-fg-secondary, #666);">
							Grid view content
						</p>
					</div>
				{/each}
			</div>
		{/snippet}
		{#snippet right()}
			<div style="margin-top: 16px;">
				{#each Array(6) as _, i}
					<div
						style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--c-border, #eee);"
					>
						<div
							style="width: 40px; height: 40px; background: var(--c-bg-secondary, #f5f5f5); border-radius: 50%; display: flex; align-items: center; justify-content: center;"
						>
							{i + 1}
						</div>
						<div>
							<strong>Item {i + 1}</strong>
							<p style="margin: 4px 0 0 0; font-size: 0.9em; color: var(--c-fg-secondary, #666);">
								List view with more details
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/snippet}
	</ToggleGroup>
</div>

<p class="a11y-ref">
	Accessibility: see repo checklist at <code>planning/a11y-checklist.md</code> and Phase 1 tracking
	in <code>planning/phases/phase_1.md</code>.
</p>
