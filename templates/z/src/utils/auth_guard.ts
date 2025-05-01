import { goto } from '$app/navigation';
import { z } from '$lib/z.svelte';

export function auth_guard() {
	if (!z.current.userID || z.current.userID === 'anon') {
		goto('/auth/login');
	} else {
	}
}
