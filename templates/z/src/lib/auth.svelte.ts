import { goto } from '$app/navigation';
import { clear_jwt, get_login, pass } from '@drop-in/pass/client';
import type { User } from '@drop-in/pass/schema';
import { cache } from './z.svelte';

// This is a way to keep track of the user globally
export class Auth {
	token: string = $state('');
	user_id: string = $state('anon');
	user: Partial<User> = $state({});

	constructor() {
		const auth = get_login();
		this.token = auth.jwt ?? '';
		this.user_id = auth.sub ?? '';
	}

	async logout() {
		// Resets the auth state
		// Reset the cache
		// Removes the cookies
		await pass.logout().catch((e) => {
			console.log('logout error', e);
		});

		clear_jwt();

		cache.reset();

		this.token = '';
		this.user_id = 'anon';
		this.user = {};
		// Redirect to the home page
		goto('/');
	}

	set_user(user: User | {}) {
		this.user = user;
	}
}

export const auth = new Auth();
