<script lang="ts">
	import "@drop-in/graffiti";
	import { Toast } from '@drop-in/decks';
	import { get_login } from "@drop-in/pass/client";
	import { create_zero } from "$lib/z";
	let { children } = $props()
	$effect.pre(() => {
		const auth = get_login();
		create_zero({
			user_id: auth.sub || 'anon',
			auth: auth.jwt,
		});
	});
</script>

<!-- If you would like to use the same layout in app and site, use this file -->
{@render children()}

<!--  
SickToast -> just use any of these methods
<button onclick={() => toast.send('Test Toast', {duration: 5000})}>Test Toast</button>
<button onclick={() => toast.warning('Test Toast')}>Test Toast</button>
<button onclick={() => toast.error('Test Toast')}>Test Toast</button>
<button onclick={() => toast.success('Test Toast')}>Test Toast</button>
<button onclick={() => toast.info('Test Toast')}>Test Toast</button>
-->
<Toast position={{ inline: 'end', block: 'end' }} offset={{ inline: '20px', block: '20px' }} />
