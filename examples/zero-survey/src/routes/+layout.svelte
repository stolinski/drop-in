<script lang="ts">
	import '@drop-in/graffiti';
	import './global.css';
	import { Toast } from '@drop-in/decks';
	import { Z, getZ } from 'zero-svelte';
	import { get_z_options } from '$lib/z.svelte';
	import type { Schema } from '../schema';
	new Z<Schema>(get_z_options());
	let z = getZ();

	let { children } = $props();
</script>

<!-- If you would like to use the same layout in app and site, use this file -->

{#key z.current.userID}
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
