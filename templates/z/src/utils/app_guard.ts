import settings from 'virtual:dropin-config';
import { goto } from '$app/navigation';
import { get_db } from '$lib/z';

// Sends users to the app if they try to access login or landing pages after logging in.
export function app_guard() {
	const z = get_db();

	if (z.userID && z.userID !== 'anon') {
		goto(settings.app.route);
	}
}
