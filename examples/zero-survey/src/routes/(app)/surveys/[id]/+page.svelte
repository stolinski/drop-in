<script lang="ts">
	import { page } from '$app/stores';
	import { Query, getZ } from 'zero-svelte';

	const z = getZ();
	const survey = new Query(
		z.current.query.surveys
			.where('id', '=', $page.params.id)
			.one()
			.related('questions', (q) => q)
	);
</script>

<a href={`/survey/${$page.params.id}`} class="button">Take Survey</a>

<h2>Responses</h2>
<a href={`/surveys/${$page.params.id}/responses`} class="button">See Responses</a>

<h2>Questions</h2>

<a href={`/surveys/${$page.params.id}/edit`} class="button">Edit</a>
<p>{survey?.current?.questions?.length} Questions</p>
