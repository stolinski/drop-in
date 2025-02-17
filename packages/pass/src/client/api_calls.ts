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

		// Set JWT cookie if it's in the response
		if (data.jwt) {
			document.cookie = `jwt=${data.jwt}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
		}

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

			// Set JWT cookie if it's in the response
			if (data.jwt) {
				document.cookie = `jwt=${data.jwt}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
			}

			return data;
		} catch (e) {
			throw e;
		}
	}

	async logout() {
		return fetch('/api/auth/logout', {
			method: 'POST',
		});
	}

	requestPasswordReset(email: string) {
		const formData = new FormData();
		formData.append('email', email);
		return fetch('/api/auth/forgot-password', {
			method: 'POST',
			body: formData,
		});
	}
	resetPassword(token: string, password: string) {
		const formData = new FormData();
		formData.append('token', token);
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
}

export const pass = new User();
