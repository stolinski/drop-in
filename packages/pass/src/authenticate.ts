// Authenticates the user with first the jwt access token, then the refresh token if necessary.
// Returns the user_id if authenticated, null otherwise.

import type { Cookies } from '@sveltejs/kit';
import { create_jwt, verify_access_token } from './jwt.js';
import { jwt_cookie_options, cookie_options } from './cookies.js';
import { refresh_refresh_token, verify_refresh_token } from './token.js';

export async function authenticate_user(cookies: Cookies) {
	// Read cookies from the server-side cookie jar
	const jwt = cookies.get('jwt');
	const refresh_token = cookies.get('refresh_token');

	// 1) Try access token first
	if (jwt) {
		try {
			const payload = await verify_access_token(jwt);
			const current_time = Math.floor(Date.now() / 1000);
			// If the token has an expiration (exp) claim, verify it hasn't expired
			if (!(payload.exp && current_time > payload.exp)) {
				const { sub } = payload;
				return { user_id: sub };
			}
		} catch (e) {
			// If verification fails (expired/invalid), fall through to refresh flow
		}
	}

	// 2) Fall back to refresh token
	if (refresh_token) {
		const refresh_payload = await verify_refresh_token(refresh_token);
		if (refresh_payload) {
			const new_jwt = await create_jwt(refresh_payload.user_id);
			// Extend the current refresh token expiry (no rotation here)
			const refreshed_refresh_token = await refresh_refresh_token(refresh_token);
			cookies.set('jwt', new_jwt, jwt_cookie_options);
			cookies.set('refresh_token', refreshed_refresh_token, cookie_options);
			return { user_id: refresh_payload.user_id };
		}
	}

	return null;
}
