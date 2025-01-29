import { goto } from '$app/navigation';
import { getZ } from 'zero-svelte';
export function auth_guard() {
	const z = getZ();
	if (!z.current.userID || z.current.userID === 'anon') {
		goto('/auth/login');
	}
}
