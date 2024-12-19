<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Query } from '$lib/query.svelte';
	import { get_cache } from '$lib/z.svelte';
	import { nanoid } from 'nanoid';

	const cache = get_cache();
	const survey = new Query(cache.z.query.surveys.where('id', '=', $page.params.id).one());

	function onclick() {
		const id = nanoid();
		cache.z.mutate.responses.insert({
			id,
			survey_id: survey.data?.id,
			started_at: Date.now()
		});
		goto(`/survey/${survey.data?.id}/${id}`);
	}
</script>

<h1>{survey.data?.title}</h1>

<button {onclick}>Let's Get Started</button>
