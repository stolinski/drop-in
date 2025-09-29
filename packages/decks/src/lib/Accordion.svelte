<script lang="ts">
	import type { Snippet } from 'svelte';
	import { animatedDetails } from './animated-details.js';

	let {
		children,
		summary,
		class: _class
	}: { children: Snippet; summary: string; class?: string } = $props();
</script>

<details use:animatedDetails class="di-accordion class={_class}">
	<summary>
		{summary}
	</summary>
	<div>
		{@render children()}
	</div>
</details>

<style>
	details {
		overflow: hidden;
	}
</style>
