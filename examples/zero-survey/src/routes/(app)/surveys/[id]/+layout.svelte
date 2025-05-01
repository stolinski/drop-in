<script lang="ts">
	import { page } from '$app/stores';
	import { Query, getZ } from 'zero-svelte';
	import { get } from 'svelte/store';

	const z = getZ();
	const id = get(page).params.id;

	let { children } = $props();
	const survey = new Query(
		z.current.query.surveys
			.where('id', '=', id)
			.one()
			.related('questions', (q) => q)
	);
</script>

<h1>{survey?.current?.title}</h1>

{@render children()}
