<script lang="ts">
	import { nanoid } from 'nanoid';
	import { get_cache } from '$lib/z.svelte';
	import { goto } from '$app/navigation';
	import { Query } from '$lib/query.svelte';

	const cache = get_cache();
	const surveys = new Query(cache.z.query.surveys.where('user_id', '=', cache.z.userID));

	async function createSurvey() {
		const id = nanoid();
		await cache.z.mutate.surveys.insert({
			id,
			title: 'New Survey',
			description: 'A new survey',
			created_at: Date.now(),
			user_id: cache.z.userID
		});
		goto(`/surveys/${id}`);
	}
</script>

<h1>Your Dashboard</h1>

<a href="/profile">Profile</a>

<button onclick={createSurvey}>Create Survey</button>

<ul>
	{#each surveys?.data as survey}
		<li><a href={`/surveys/${survey.id}`}>{survey.title}</a></li>
	{/each}
</ul>
