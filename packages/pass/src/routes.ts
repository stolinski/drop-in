import type { RequestEvent, Handle } from '@sveltejs/kit';
import { sign_up } from './sign_up.js';
import { login } from './login.js';
import { logout } from './logout.js';
import { parseFormData } from 'parse-nested-form-data';
import { cookie_options, jwt_cookie_options } from './cookies.js';
import { create_expiring_auth_digest } from './utils.js';
import { eq } from 'drizzle-orm';
import { user } from './schema.js';
import { send_verification_email } from './email.js';
import { authenticate_user } from './authenticate.js';
import { get_user_by_id } from './find_user.js';
import { request_password_reset, reset_password } from './reset_password.js';

export type FormData = {
	email?: string;
	password?: string;
	user_id?: string;
	token?: string;
	expire?: number;
};

export async function sign_up_route(db: any, event: RequestEvent, data: FormData) {
	if (!data.email || !data.password) {
		return new Response(JSON.stringify({ error: 'Email and password are required' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
	const sign_up_response = await sign_up(db, data.email, data.password);

	if (sign_up_response?.refresh_token && sign_up_response?.jwt) {
		const { refresh_token, jwt } = sign_up_response;
		const refresh_token_cookie = event.cookies.serialize('refresh_token', refresh_token, cookie_options);
		const jwt_cookie = event.cookies.serialize('jwt', jwt, jwt_cookie_options);

		const newUserId = sign_up_response.user?.id;
		if (newUserId) {
			// Fire-and-forget verification email; do not block signup
			Promise.resolve(send_verification_email(db, newUserId)).catch((e) =>
				console.warn('Failed to send verification email:', e),
			);
		}

		return new Response(JSON.stringify({ status: 'success', user: sign_up_response.user, jwt }), {
			status: 200,
			headers: [
				['Content-Type', 'application/json'],
				['Set-Cookie', refresh_token_cookie],
				['Set-Cookie', jwt_cookie],
			],
		});
	}
	return new Response(JSON.stringify({ status: 'error', error: 'Signup Failed' }), {
		status: 400,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function login_route(db: any, event: RequestEvent, data: FormData) {
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

	const login_response = await login(db, data.email, data.password);

	if (login_response?.refresh_token && login_response?.jwt) {
		const { refresh_token, jwt } = login_response;

		const refresh_token_cookie = event.cookies.serialize('refresh_token', refresh_token, cookie_options);
		const jwt_cookie = event.cookies.serialize('jwt', jwt, jwt_cookie_options);

		return new Response(JSON.stringify({ status: 'success', user: login_response.user, jwt }), {
			status: 200,
			headers: [
				['Content-Type', 'application/json'],
				['Set-Cookie', refresh_token_cookie],
				['Set-Cookie', jwt_cookie],
			],
		});
	}
	return new Response(JSON.stringify({ status: 'error', error: 'Login Failed' }), {
		status: 400,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function logout_route(db: any, event: RequestEvent) {
	// Get the refresh_token from the request
	const refresh_token = event.cookies.get('refresh_token');
	const jwt = event.cookies.get('jwt');

	if (!refresh_token || !jwt) {
		return new Response('No refresh token or JWT found', {
			status: 400,
		});
	}

	await logout(db, refresh_token, jwt);

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
		headers: [
			['Content-Type', 'text/plain'],
			['Set-Cookie', refresh_token_cookie],
			['Set-Cookie', jwt_cookie],
		],
	});
}

/**
 * Handles the email verification route.
 *
 * @param event - The event object
 * @param data - The form data
 * @returns The response object
 */
export async function verify_email_route(db: any, event: RequestEvent, data: FormData) {
	const verification_token = data.token;
	const email = data.email;
	const expire = data.expire;

	if (!verification_token || !email || !expire) {
		return new Response('Invalid token', {
			status: 400,
		});
	}
	const test_token = create_expiring_auth_digest(email, expire);
	if (process.env.DEBUG) console.log('DEBUG: verify-email test_token', test_token);
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

export async function send_verify_email_route(db: any, _event: RequestEvent, data: FormData) {
	const user_id = data.user_id;
	if (!user_id) {
		return new Response('User ID is required', {
			status: 400,
		});
	}
	try {
		await send_verification_email(db, user_id);
	} catch (error) {
		return new Response('Error', {
			status: 500,
		});
	}
	return new Response('Success', {
		status: 200,
	});
}

export async function me_route(db: any, event: RequestEvent) {
	const auth_result = await authenticate_user(db, event.cookies);

	if (!auth_result) {
		return new Response(JSON.stringify({ error: 'Not authenticated' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	const user_data = await get_user_by_id(db, auth_result.user_id);

	if (!user_data) {
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	return new Response(JSON.stringify({ user: user_data }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function forgot_password_route(db: any, _event: RequestEvent, data: FormData) {
	const email = data.email;
	if (!email) {
		return new Response(JSON.stringify({ error: 'Email is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	await request_password_reset(db, email);
	return new Response(JSON.stringify({ status: 'success' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function reset_password_route(db: any, event: RequestEvent, data: FormData) {
	const email = data.email;
	const token = data.token;
	const expire = data.expire;
	const password = data.password;

	if (!email || !token || !expire || !password) {
		return new Response(JSON.stringify({ error: 'Missing required fields' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const result = await reset_password(db, email, token, Number(expire), password);
	if (!result) {
		return new Response(JSON.stringify({ error: 'Password reset failed' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const refresh_token_cookie = event.cookies.serialize('refresh_token', result.refresh_token, cookie_options);
	const jwt_cookie = event.cookies.serialize('jwt', result.jwt, jwt_cookie_options);

	return new Response(
		JSON.stringify({ status: 'success', user: result.user, jwt: result.jwt }),
		{
			status: 200,
			headers: [
				['Content-Type', 'application/json'],
				['Set-Cookie', refresh_token_cookie],
				['Set-Cookie', jwt_cookie],
			],
		},
	);
}

/**
 * Create a SvelteKit handle that wires up auth routes using the provided db instance.
 */
export function create_pass_routes(db: any): Handle {
	const handle: Handle = async ({ event, resolve }) => {
		const { url } = event;

		// Check if the URL matches your auth routes
		if (url.pathname.startsWith('/api/auth')) {
			// Make a clone to prevent error in already read body
			const request_2 = event.request.clone();
			let data: Record<string, any> = {};
			// Check if the content type is multipart/form-data
			if (request_2.headers.get('content-type')?.includes('multipart/form-data')) {
				// Get form data
				const form_data = await request_2.formData();
				// Parse that ish
				data = parseFormData(form_data) as any;
			}

			if (url.pathname === '/api/auth/login') {
				return login_route(db, event, data);
			} else if (url.pathname === '/api/auth/register') {
				return sign_up_route(db, event, data);
			} else if (url.pathname === '/api/auth/logout') {
				return logout_route(db, event);
			} else if (url.pathname === '/api/auth/me') {
				return me_route(db, event);
			} else if (url.pathname === '/api/auth/verify-email') {
				return verify_email_route(db, event, data);
			} else if (url.pathname === '/api/auth/send-verify-email') {
				return send_verify_email_route(db, event, data);
			} else if (url.pathname === '/api/auth/forgot-password') {
				return forgot_password_route(db, event, data);
			} else if (url.pathname === '/api/auth/reset-password') {
				return reset_password_route(db, event, data);
			}
			// Return 404 for unhandled auth routes
			return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
		}

		// If it's not an auth route, continue with the next handler
		return resolve(event);
	};
	return handle;
}
