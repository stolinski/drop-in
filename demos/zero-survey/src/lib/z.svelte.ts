import { PUBLIC_SERVER } from '$env/static/public';
import { Zero } from '@rocicorp/zero';
import { schema } from '../schema';
import { getContext, setContext } from 'svelte';
import { get_login } from '@drop-in/pass/client';

// This is the state of the Zero instance
// You can reset it on login or logout
export class ZCache {
	z: Zero<typeof schema> = $state(null!);

	constructor() {
		this.build();
		setContext('z', this);
	}

	build() {
		// Get jwt and decode it
		const options = get_z_options();
		// Create new Zero instance
		this.z = new Zero(options);
	}

	// Reset the Zero instance
	reset() {
		// Frist close
		// Should this be this tied to the cahce itself?
		this.z?.close();
		this.build();
	}
}

export function get_cache() {
	return getContext<ZCache>('z');
}

export function get_z_options() {
	const a = get_login();

	return {
		userID: a.sub ?? 'anon',
		server: PUBLIC_SERVER,
		schema,
		auth: a.jwt
	} as const;
}
