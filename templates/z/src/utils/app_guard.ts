import settings from 'virtual:dropin-config';
import { goto } from '$app/navigation';
import { auth } from '$lib/auth.svelte';
// Sends users to the app if they try to access login or landing pages after logging in.
export function app_guard() {
	console.log('APP GUARD', auth.user_id);
	console.log('APP GAURD CANARY', auth.canary);
	if (auth.user_id && auth.user_id !== 'anon') {
		goto(settings.app.route);
	}
}
