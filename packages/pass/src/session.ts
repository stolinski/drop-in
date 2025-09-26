import type { RequestEvent, Handle } from '@sveltejs/kit';
import { verify_access_token } from './jwt.js';

/**
 * Populate event.locals.user with authenticated user data
 * This should be used in hooks.server.ts or as part of a handle chain
 */
export async function populate_user_session(db: any, event: RequestEvent): Promise<void> {
	const jwt = event.cookies.get('jwt');
	if (!jwt) {
		if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: no jwt cookie; skipping session');
		return;
	}

	try {
		const payload = await verify_access_token(jwt);
		const user_id = payload.sub;

		try {
			const { get_user_by_id } = await import('./find_user.js');
			const user_data = await get_user_by_id(db, user_id);
			if (user_data) {
				event.locals.user = user_data;
			}
		} catch (e) {
			if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: user hydrate failed; continuing without DB');
		}
	} catch (e) {
		if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: jwt verification failed; skipping session');
	}
}

/**
 * Factory returning a handle that automatically populates user session for requests.
 */
export function create_session_handle(db: any): Handle {
	const handle: Handle = async ({ event, resolve }) => {
		await populate_user_session(db, event);
		return resolve(event);
	};
	return handle;
}
