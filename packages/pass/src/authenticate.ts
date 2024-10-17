// Authenticates the user with first the jwt access token, then the refresh token if necessary.
// Returns the user_id if authenticated, null otherwise.

import type { Cookies } from '@sveltejs/kit';
import { get_raw_jwt } from './client_jwt';
import { create_jwt, verify_access_token } from './jwt';
import { jwt_cookie_options, cookie_options } from './cookies';
import { refresh_refresh_token } from './token';
import { verify_refresh_token } from './token';

export async function authenticate_user(cookies: Cookies) {
	// Get cookies
	const jwt = get_raw_jwt();
	const refresh_token = cookies.get('refresh_token');

	if (jwt) {
		// Check if jwt access token is valid
		const payload = await verify_access_token(jwt);

		const current_time = Math.floor(Date.now() / 1000);

		// If the token has an expiration (exp) claim, verify it hasn't expired
		if (!(payload.exp && current_time > payload.exp)) {
			// Return the payload with your custom fields
			const { sub } = payload;
			return { user_id: sub };
		}
	} else if (refresh_token) {
		// Check if refresh token is valid
		// If it's valid, create a new jwt, update the refresh token expiration
		const refresh_payload = await verify_refresh_token(refresh_token);
		if (refresh_payload) {
			const jwt = await create_jwt(refresh_payload.user_id);
			const refresh_token = await refresh_refresh_token(refresh_payload.user_id);
			cookies.set('jwt', jwt, jwt_cookie_options);
			cookies.set('refresh_token', refresh_token, cookie_options);
			return { user_id: refresh_payload.user_id };
		}
	}

	return null;
}
