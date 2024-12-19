<script lang="ts">
	import { page } from '$app/stores';
	import { Query } from '$lib/query.svelte';
	import { get_cache } from '$lib/z.svelte';
	import { get } from 'svelte/store';

	const cache = get_cache();
	const id = get(page).params.id;

	let { children } = $props();
	const survey = new Query(
		cache.z.query.surveys
			.where('id', '=', id)
			.one()
			.related('questions', (q) => q)
	);
</script>

<h1>{survey?.data?.title}</h1>

{@render children()}
