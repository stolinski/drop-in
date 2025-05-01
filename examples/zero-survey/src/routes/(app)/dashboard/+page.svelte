<script lang="ts">
	import { nanoid } from 'nanoid';
	import { Query, getZ } from 'zero-svelte';

	const z = getZ();
	const surveys = new Query(z.current.query.surveys.where('user_id', '=', z.current.userID));

	async function createSurvey() {
		const id = nanoid();

		const res = await z.current.mutate.surveys.insert({
			id,
			title: 'New Survey',
			description: 'A new survey',
			created_at: Date.now(),
			user_id: z.current.userID
		});
		console.log('res', res);
		// goto(`/surveys/${id}`);
	}
</script>

<h1>Your Dashboard</h1>

<a href="/profile">Profile</a>

<button onclick={createSurvey}>Create Survey</button>

<ul>
	{#each surveys?.current as survey}
		<li><a href={`/surveys/${survey.id}`}>{survey.title}</a></li>
	{/each}
</ul>
