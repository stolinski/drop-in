<script lang="ts">
	import Pill from './Pill.svelte';

	let { content }: { content: { text: string; link?: string }[] | string[] } = $props();
</script>

{#each content as pill}
	{#if typeof pill === 'string'}
		<Pill>{pill}</Pill>
	{:else}
		<Pill link={pill.link}>{pill.text}</Pill>
	{/if}
{/each}
