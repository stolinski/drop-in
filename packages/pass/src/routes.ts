import type { RequestEvent, Handle } from '@sveltejs/kit';
import { sign_up } from './sign_up';
import { login } from './login';
import { logout } from './logout';
import { parseFormData } from 'parse-nested-form-data';
import { cookie_options, jwt_cookie_options } from './cookies';
import { create_expiring_auth_digest } from './utils';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { user } from './schema';

type FormData = {
	email?: string;
	password?: string;
};

export async function sign_up_route(event: RequestEvent, data: FormData) {
	if (!data.email || !data.password) {
		return new Response(JSON.stringify({ error: 'Email and password are required' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
	const sign_up_response = await sign_up(data.email, data.password);

	if (sign_up_response?.refresh_token && sign_up_response?.jwt) {
		const { refresh_token, jwt } = sign_up_response;
		const refresh_token_cookie = event.cookies.serialize(
			'refresh_token',
			refresh_token,
			cookie_options,
		);
		const jwt_cookie = event.cookies.serialize('jwt', jwt, jwt_cookie_options);

		return new Response(JSON.stringify({ status: 'success' }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': `${refresh_token_cookie}, ${jwt_cookie}`,
			},
		});
	}
	return new Response(JSON.stringify({ status: 'error', error: 'Signup Failed' }), {
		status: 400,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function login_route(event: RequestEvent, data: FormData) {
	if (!data.email || !data.password) {
		return new Response(
			JSON.stringify({ status: 'error', error: 'Email and password are required' }),
			{
				headers: {
					'Content-Type': 'application/json',
				},
				status: 400,
			},
		);
	}

	const login_response = await login(data.email, data.password);

	if (login_response?.refresh_token && login_response?.jwt) {
		const { refresh_token, jwt } = login_response;

		const refresh_token_cookie = event.cookies.serialize(
			'refresh_token',
			refresh_token,
			cookie_options,
		);
		const jwt_cookie = event.cookies.serialize('jwt', jwt, jwt_cookie_options);

		return new Response(JSON.stringify({ status: 'success' }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': `${refresh_token_cookie}, ${jwt_cookie}`,
			},
		});
	}
	return new Response(JSON.stringify({ status: 'error', error: 'Login Failed' }), {
		status: 400,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function logout_route(event: RequestEvent) {
	// Get the refresh_token from the request
	const refresh_token = event.cookies.get('refresh_token');
	const jwt = event.cookies.get('jwt');

	if (!refresh_token || !jwt) {
		return new Response('No refresh token or JWT found', {
			status: 400,
		});
	}

	await logout(refresh_token, jwt);

	const refresh_token_cookie = event.cookies.serialize('refresh_token', '', {
		...cookie_options,
		maxAge: 0,
	});
	const jwt_cookie = event.cookies.serialize('jwt', '', {
		...jwt_cookie_options,
		maxAge: 0,
	});

	return new Response('Success', {
		status: 200,
		headers: {
			'Content-Type': 'text/plain',
			'Set-Cookie': `${refresh_token_cookie}, ${jwt_cookie}`,
		},
	});
}

/**
 * Handles the email verification route.
 *
 * @param event - The event object
 * @param data - The form data
 * @returns The response object
 */
export async function verify_email_route(event: RequestEvent, data: FormData) {
	// Get toke from query params.
	const verification_token = event.url.searchParams.get('token');
	const email = event.url.searchParams.get('email');
	const expire = parseInt(event.url.searchParams.get('expire') || '0', 10);
	if (!verification_token || !email || !expire) {
		return new Response('Invalid token', {
			status: 400,
		});
	}
	const test_token = create_expiring_auth_digest(email, expire);
	if (verification_token !== test_token) {
		return new Response('Invalid token', {
			status: 400,
		});
	}
	// Check to make sure it's not expired.
	if (Date.now() > expire) {
		return new Response('Token expired', {
			status: 400,
		});
	}
	// Verify the user.
	await db
		.update(user)
		.set({ verified: true, verification_token: null })
		.where(eq(user.email, email))
		.execute();
	// Redirect to home.
	return new Response('Success', {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}

/**
 * Handles the authentication routes.
 *
 * @param event - The event object
 * @param resolve - The resolve function
 * @returns The response object
 */
export const pass_routes: Handle = async ({ event, resolve }) => {
	const { url } = event;

	// Check if the URL matches your auth routes
	if (url.pathname.startsWith('/api/auth')) {
		// Make a clone to prevent error in already read body
		const request_2 = event.request.clone();
		let data = {};
		// Check if the content type is multipart/form-data
		if (request_2.headers.get('content-type')?.includes('multipart/form-data')) {
			// Get form data
			const form_data = await request_2.formData();
			// Parse that ish
			data = parseFormData(form_data);
		}

		if (url.pathname === '/api/auth/login') {
			return login_route(event, data);
		} else if (url.pathname === '/api/auth/register') {
			return sign_up_route(event, data);
		} else if (url.pathname === '/api/auth/logout') {
			return logout_route(event);
		} else if (url.pathname === '/api/auth/verify-email') {
			return verify_email_route(event, data);
		}
		// Return 404 for unhandled auth routes
		return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
	}

	// If it's not an auth route, continue with the next handler
	return resolve(event);
};

// TODO magic link auth?
