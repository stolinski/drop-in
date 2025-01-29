import settings from 'virtual:dropin-config';
import { goto } from '$app/navigation';
import { getZ } from 'zero-svelte';
// Sends users to the app if they try to access login or landing pages after logging in.
export function app_guard() {
	const z = getZ();
	if (z.current.userID && z.current.userID !== 'anon') {
		goto(settings.app.route);
	}
}
