import { goto } from '$app/navigation';
import { get_db } from '$lib/z';

export function auth_guard() {
	const z = get_db();
	if (!z.userID || z.userID === 'anon') {
		goto('/auth/login');
	}
}
