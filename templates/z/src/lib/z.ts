import { getContext, setContext } from 'svelte';
import { PUBLIC_SERVER } from '$env/static/public';
import { Zero } from '@rocicorp/zero';
import { schema } from './data/schema';

export function create_zero({ user_id, auth }: { user_id: string; auth: string }) {
	const z = new Zero({
		// Documentation on auth coming soon.
		userID: user_id,
		server: PUBLIC_SERVER,
		schema,

		// This is easier to develop with until we make the persistent state
		// delete itself on schema changes. Just remove to get persistent storage.
		kvStore: 'mem',
		auth,
	});

	return setContext('zero', z);
}

export function get_db() {
	return getContext<ReturnType<typeof create_zero>>('zero');
}
