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
	@media (prefers-reduced-motion: reduce) {
		/* When reduced motion, animatedDetails will set duration 0 via JS tokens; ensure no CSS transitions linger */
		.di-accordion,
		.di-accordion * {
			transition: none !important;
		}
	}

	details {
		overflow: hidden;
	}
</style>
