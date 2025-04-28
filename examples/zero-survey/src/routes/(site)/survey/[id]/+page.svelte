<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Query } from 'zero-svelte';
	import { getZ } from 'zero-svelte';
	import { nanoid } from 'nanoid';

	const z = getZ();
	const survey = new Query(z.current.query.surveys.where('id', '=', $page.params.id).one());

	function onclick() {
		const id = nanoid();
		z.current.mutate.responses.insert({
			id,
			survey_id: survey.current?.id,
			started_at: Date.now()
		});
		goto(`/survey/${survey.current?.id}/${id}`);
	}
</script>

<h1>{survey.current?.title}</h1>

<button {onclick}>Let's Get Started</button>
