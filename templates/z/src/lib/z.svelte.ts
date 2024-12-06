import { PUBLIC_SERVER } from '$env/static/public';
import { Zero } from '@rocicorp/zero';
import { schema } from './data/schema';
import { getContext } from 'svelte';
import { get_login } from '@drop-in/pass/client';
import { auth } from './auth.svelte';

// This is the state of the Zero instance
// You can reset it on login or logout
export class Cache {
	z: Zero<typeof schema> | undefined = $state();

	constructor() {
		// Get jwt and decode it
		const a = get_login();
		// Create new Zero instance
		this.z = new Zero({
			userID: a.sub ?? 'anon',
			server: PUBLIC_SERVER,
			schema,
			kvStore: 'mem',
			auth: a.jwt ?? ''
		});
	}

	// Reset the Zero instance
	reset() {
		// Frist close
		this.z?.close();
		// Get jwt and decode it
		const a = get_login();
		// Create new Zero instance
		this.z = new Zero({
			userID: a.sub ?? 'anon',
			server: PUBLIC_SERVER,
			schema,
			kvStore: 'mem',
			auth: a.jwt ?? ''
		});
	}
}

export const cache = new Cache();

export function get_cache() {
	return getContext<Zero<typeof schema>>('z');
}
