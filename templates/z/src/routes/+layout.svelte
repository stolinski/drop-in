<script lang="ts">
	import '@drop-in/graffiti';
	import { Toast } from '@drop-in/decks';
	import { auth } from '$lib/auth.svelte';
	import { cache } from '$lib/z.svelte';
	import UserWrapper from './UserWrapper.svelte';

	const z = $derived(cache.z);
	let { children } = $props();
</script>

<!-- If you would like to use the same layout in app and site, use this file -->

{#key auth.user_id}
	<UserWrapper>
		{@render children()}
	</UserWrapper>
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
