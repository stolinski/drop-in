import type { RequestEvent, Handle } from '@sveltejs/kit';
import { authenticate_user } from './authenticate.js';
import { get_user_by_id } from './find_user.js';

/**
 * Populate event.locals.user with authenticated user data
 * This should be used in hooks.server.ts or as part of a handle chain
 */
export async function populate_user_session(event: RequestEvent): Promise<void> {
	const auth_result = await authenticate_user(event.cookies);
	
	if (auth_result) {
		const user_data = await get_user_by_id(auth_result.user_id);
		if (user_data) {
			event.locals.user = user_data;
		}
	}
}

/**
 * Handle function that can be used in hooks.server.ts to automatically
 * populate user session for all requests
 */
export const session_handle: Handle = async ({ event, resolve }) => {
	await populate_user_session(event);
	return resolve(event);
};