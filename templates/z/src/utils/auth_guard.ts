import { goto } from '$app/navigation';

export function auth_guard() {
	let user;
	// TODO: Auth gaurd
	// if (pb.authStore.isValid) {
	// 	user = pb.authStore.model as UsersResponse
	// } else {
	// 	user = undefined
	// }

	if (!user) {
		goto('/auth/login');
	}
}
