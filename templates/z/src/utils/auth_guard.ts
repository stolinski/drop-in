import { goto } from '$app/navigation';
import { auth } from '$lib/auth.svelte';

export function auth_guard() {
	if (!auth.user_id || auth.user_id === 'anon') {
		goto('/auth/login');
	}
}
