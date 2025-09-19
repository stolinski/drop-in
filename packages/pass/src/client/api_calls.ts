// Client-side API calls for authentication
// JWT is now HttpOnly and managed server-side for security

// JWT cookie options are no longer needed since JWT is set server-side as HttpOnly
// const JWT_COOKIE_OPTIONS = {
// 	path: '/',
// 	expires: 7, // 7 days (js-cookie uses days, not seconds)
// 	secure: true,
// 	sameSite: 'strict' as const,
// };

// function setJwtCookie(jwt: string) {
// 	Cookies.set('jwt', jwt, JWT_COOKIE_OPTIONS);
// }

class User {
	async login(email: string, password: string) {
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);

		const res = await fetch('/api/auth/login', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});

		const data = await res.json().catch(() => null);

		if (!res.ok) {
			// Handle server error responses
			throw new Error(data?.error || 'Login failed. Please check your credentials.');
		}

		if (!data) {
			throw new Error('Invalid response from server');
		}

		// JWT is now set server-side as HttpOnly cookie, no need to set it manually

		return data;
	}
	async signup(email: string, password: string) {
		try {
			const formData = new FormData();
			formData.append('email', email);
			formData.append('password', password);
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});

			const data = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(data?.error || 'Registration failed. Please try again.');
			}

			// JWT is now set server-side as HttpOnly cookie, no need to set it manually

			return data;
		} catch (e) {
			throw e;
		}
	}

	async logout() {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'include',
		});

		// JWT clearing is now handled server-side via Set-Cookie headers
		return response;
	}

	requestPasswordReset(email: string) {
		const formData = new FormData();
		formData.append('email', email);
		return fetch('/api/auth/forgot-password', {
			method: 'POST',
			body: formData,
		});
	}
	resetPassword(email: string, token: string, expire: number, password: string) {
		const formData = new FormData();
		formData.append('email', email);
		formData.append('token', token);
		formData.append('expire', expire.toString());
		formData.append('password', password);
		return fetch('/api/auth/reset-password', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});
	}

	verifyEmail(token: string, email: string, expire: number) {
		const formData = new FormData();
		formData.append('token', token);
		formData.append('email', email);
		formData.append('expire', expire.toString());
		return fetch('/api/auth/verify-email', {
			method: 'POST',
			body: formData,
		});
	}

	sendVerifyEmail(user_id: string) {
		const formData = new FormData();
		formData.append('user_id', user_id);
		return fetch('/api/auth/send-verify-email', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});
	}

	/**
	 * Get current user information
	 * @returns Promise with user data or throws if not authenticated
	 */
	async me() {
		const response = await fetch('/api/auth/me', {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('Not authenticated');
			}
			throw new Error('Failed to get user information');
		}

		return response.json();
	}
}

export const pass = new User();
