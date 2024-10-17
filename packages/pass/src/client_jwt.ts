// Client JWT utilities
// These are jwt utilities that the client or the server can use, but they don't leak anything from the server.

import { decodeJwt } from 'jose';
import Cookies from 'js-cookie';
import { JWTPayload } from './jwt';

export function get_jwt(): JWTPayload | undefined {
	const token = get_raw_jwt();
	if (!token) {
		return undefined;
	}
	const payload = decodeJwt(token);
	const currentTime = Math.floor(Date.now() / 1000);
	if (payload.exp && payload.exp < currentTime) {
		return undefined;
	}

	return payload as JWTPayload;
}

export function get_raw_jwt() {
	return Cookies.get('jwt');
}

export function clear_jwt() {
	delete_cookie('jwt');
}

function delete_cookie(name: string) {
	Cookies.remove(name);
}

// Just a better named version of get_jwt for the client facing code
export function get_login() {
	return get_jwt();
}
