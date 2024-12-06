<script lang="ts">
	import '@drop-in/graffiti';
	import { Toast } from '@drop-in/decks';
	import { get_cache, ZCache } from '$lib/z.svelte';
	new ZCache();
	let cache = get_cache();
	let { children } = $props();
</script>

<!-- If you would like to use the same layout in app and site, use this file -->

{#key cache.z.userID}
	{@render children()}
{/key}

<!--  
SickToast -> just use any of these methods
<button onclick={() => toast.send('Test Toast', {duration: 5000})}>Test Toast</button>
<button onclick={() => toast.warning('Test Toast')}>Test Toast</button>
<button onclick={() => toast.error('Test Toast')}>Test Toast</button>
<button onclick={() => toast.success('Test Toast')}>Test Toast</button>
<button onclick={() => toast.info('Test Toast')}>Test Toast</button>
-->
<Toast position={{ inline: 'end', block: 'end' }} offset={{ inline: '20px', block: '20px' }} />
