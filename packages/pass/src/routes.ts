import type { RequestEvent, Handle } from '@sveltejs/kit';
import { sign_up } from './sign_up';
import { login } from './login';
import { logout } from './logout';
import { parseFormData } from 'parse-nested-form-data';
import { cookie_options, jwt_cookie_options } from './cookies';

type FormData = {
	email?: string;
	password?: string;
};

export async function sign_up_route(event: RequestEvent, data: FormData) {
	if (!data.email || !data.password) {
		return new Response(JSON.stringify({ error: 'Email and password are required' }), {
			status: 400,
		});
	}
	const sign_up_response = await sign_up(data.email, data.password);
	if (sign_up_response?.refresh_token && sign_up_response?.jwt) {
		const { refresh_token, jwt } = sign_up_response;

		event.cookies.set('refresh_token', refresh_token, cookie_options);
		event.cookies.set('jwt', jwt, jwt_cookie_options);

		return new Response('Success', {
			status: 200,
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	}
	return new Response('Failed', {
		status: 400,
		headers: {
			'Content-Type': 'text/plain',
		},
	});
}

export async function login_route(event: RequestEvent, data: FormData) {
	if (!data.email || !data.password) {
		return new Response(JSON.stringify({ error: 'Email and password are required' }), {
			status: 400,
		});
	}

	const login_response = await login(data.email, data.password);

	if (login_response?.refresh_token && login_response?.jwt) {
		const { refresh_token, jwt } = login_response;

		event.cookies.set('refresh_token', refresh_token, cookie_options);
		event.cookies.set('jwt', jwt, jwt_cookie_options);

		return new Response('Success', {
			status: 200,
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	}
	return new Response('Failed', {
		status: 400,
		headers: {
			'Content-Type': 'text/plain',
		},
	});
}

export async function logout_route(event: RequestEvent) {
	// Get the refresh_token from the request
	const refresh_token = event.request.headers.get('refresh_token');

	await logout(refresh_token);

	event.cookies.delete('refresh_token', cookie_options);
	event.cookies.delete('jwt', jwt_cookie_options);

	return new Response('Success', {
		status: 200,
		headers: {
			'Content-Type': 'text/plain',
		},
	});
}

export const pass_routes: Handle = async ({ event, resolve }) => {
	const { url } = event;

	// Check if the URL matches your auth routes
	if (url.pathname.startsWith('/auth')) {
		// Make a clone to prevent error in already read body
		const request_2 = event.request.clone();
		// Get form data
		const form_data = await request_2.formData();
		// Parse that ish
		const data = parseFormData(form_data);

		if (url.pathname === '/auth/login') {
			return login_route(event, data);
		} else if (url.pathname === '/auth/register') {
			return sign_up_route(event, data);
		} else if (url.pathname === '/auth/logout') {
			return logout_route(event);
		}
		// Return 404 for unhandled auth routes
		return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
	}

	// If it's not an auth route, continue with the next handler
	return resolve(event);
};
