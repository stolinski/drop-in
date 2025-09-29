import type { RequestEvent, Handle } from '@sveltejs/kit';

/**
 * Populate event.locals.user with authenticated user data.
 * Uses full auth flow (JWT or refresh) and updates cookies if refreshed.
 */
export async function populate_user_session(db: any, event: RequestEvent): Promise<void> {
	try {
		const { authenticate_user } = await import('./authenticate.js');
		const auth = await authenticate_user(db, event.cookies);
		if (!auth) {
			if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: no valid session; skipping user populate');
			return;
		}

		const user_id = auth.user_id;

		try {
			const { get_user_by_id } = await import('./find_user.js');
			const user_data = await get_user_by_id(db, user_id);
			if (user_data) {
				event.locals.user = user_data;
			}
		} catch (_e) {
			if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: user hydrate failed; continuing without DB');
		}
	} catch (_e) {
		if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: session auth failed');
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
