import { PUBLIC_SERVER } from '$env/static/public';
import { Z } from 'zero-svelte';
import { get_login } from '@drop-in/pass/client';
import { schema, type Schema } from '../schema';

export function get_z_options() {
	const a = get_login();

	return {
		userID: a.sub ?? 'anon',
		server: PUBLIC_SERVER,
		schema,
		auth: a.jwt
	} as const;
}

export const z = new Z<Schema>(get_z_options());
