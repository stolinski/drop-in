import { goto } from '$app/navigation';
import { get_cache } from '$lib/z.svelte';

export function auth_guard() {
	const cache = get_cache();
	if (!cache.z.userID || cache.z.userID === 'anon') {
		goto('/auth/login');
	}
}
