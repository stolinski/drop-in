// Client JWT utilities
// These utilities are deprecated since JWT is now HttpOnly for security.
// Use server-side session data or /api/auth/me endpoint instead.

import { decodeJwt } from 'jose';
import { JWTPayload } from './jwt.js';

/**
 * @deprecated JWT is now HttpOnly and cannot be read client-side.
 * Use event.locals.user on the server or call /api/auth/me instead.
 */
export function get_jwt(): JWTPayload | undefined {
	console.warn('get_jwt() is deprecated. JWT is now HttpOnly. Use server-side session or /api/auth/me instead.');
	return undefined;
}

/**
 * @deprecated JWT is now HttpOnly and cannot be read client-side.
 */
export function get_raw_jwt() {
	console.warn('get_raw_jwt() is deprecated. JWT is now HttpOnly and cannot be accessed client-side.');
	return undefined;
}

/**
 * @deprecated JWT clearing is now handled server-side via logout endpoint.
 */
export function clear_jwt() {
	console.warn('clear_jwt() is deprecated. JWT clearing is handled server-side via logout.');
}

/**
 * @deprecated Use server-side session data or /api/auth/me endpoint instead.
 * Returns null as JWT is no longer readable client-side.
 */
export function get_login() {
	console.warn('get_login() is deprecated. Use server-side session or /api/auth/me instead.');
	return {
		sub: undefined,
		jwt: undefined,
	};
}
