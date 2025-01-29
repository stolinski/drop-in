import { PUBLIC_SERVER } from '$env/static/public';
import { schema } from '../schema';
import { get_login } from '@drop-in/pass/client';

export function get_z_options() {
	const a = get_login();

	return {
		userID: a.sub ?? 'anon',
		server: PUBLIC_SERVER,
		schema,
		auth: a.jwt
	} as const;
}
