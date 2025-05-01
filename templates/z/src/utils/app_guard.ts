import { goto } from '$app/navigation';
import { z } from '$lib/z.svelte';

// Sends users to the app if they try to access login or landing pages after logging in.
export function app_guard() {
	if (z.current.userID && z.current.userID !== 'anon') {
		goto('/dashboard');
	}
}
