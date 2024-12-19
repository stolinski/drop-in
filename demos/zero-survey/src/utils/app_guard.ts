import settings from 'virtual:dropin-config';
import { goto } from '$app/navigation';
import { get_cache } from '$lib/z.svelte';
// Sends users to the app if they try to access login or landing pages after logging in.
export function app_guard() {
	const cache = get_cache();
	if (cache.z.userID && cache.z.userID !== 'anon') {
		goto(settings.app.route);
	}
}
