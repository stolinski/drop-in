import { settings } from '$settings';
import { goto } from '$app/navigation';

// Sends users to the app if they try to access login or landing pages after logging in.
export function app_guard() {
	let user;
	// TODO App gaurd
	// if (pb.authStore.isValid) {
	// 	user = pb.authStore.model
	// } else {
	// 	user = undefined
	// }

	if (user) {
		goto(settings.app_route);
	}
}
