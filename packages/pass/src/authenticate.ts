// Authenticates the user with first the jwt access token, then the refresh token if necessary.
// Returns the user_id if authenticated, null otherwise.

import type { Cookies } from '@sveltejs/kit';
import { create_jwt, verify_access_token } from './jwt.js';
import { jwt_cookie_options, cookie_options } from './cookies.js';

export async function authenticate_user(db: any, cookies: Cookies) {
	// Read cookies from the server-side cookie jar
	const jwt = cookies.get('jwt');
	const refresh_token = cookies.get('refresh_token');

	if (!jwt && !refresh_token) {
		if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: no auth cookies found');
		return null;
	}

	// 1) Try access token first
	if (jwt) {
		try {
			const payload = await verify_access_token(jwt);
			const current_time = Math.floor(Date.now() / 1000);
			if (!(payload.exp && current_time > payload.exp)) {
				const { sub } = payload;
				return { user_id: sub };
			}
		} catch (e) {
			// fall through to refresh flow
		}
	}

	// 2) Fall back to refresh token
	if (refresh_token) {
		try {
			const { verify_refresh_token, refresh_refresh_token } = await import('./token.js');
			const refresh_payload = await verify_refresh_token(db, refresh_token);
			if (refresh_payload) {
				const new_jwt = await create_jwt(refresh_payload.user_id);
				const refreshed_refresh_token = await refresh_refresh_token(db, refresh_token);
				cookies.set('jwt', new_jwt, jwt_cookie_options);
				cookies.set('refresh_token', refreshed_refresh_token, cookie_options);
				return { user_id: refresh_payload.user_id };
			}
		} catch (e) {
			if (process.env.PASS_DEBUG) console.log('PASS_DEBUG: refresh flow failed');
		}
	}

	return null;
}
