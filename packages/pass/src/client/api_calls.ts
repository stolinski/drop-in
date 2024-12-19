class User {
	async login(email: string, password: string) {
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);

		const res = await fetch('/api/auth/login', {
			method: 'POST',
			body: formData,
		});

		const data = await res.json().catch(() => null);
		console.log('data', data);

		if (!res.ok) {
			// Handle server error responses
			throw new Error(data?.error || 'Login failed. Please check your credentials.');
		}

		if (!data) {
			throw new Error('Invalid response from server');
		}
		console.log('data', data);

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
			});

			const data = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(data?.error || 'Registration failed. Please try again.');
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
		return fetch('/api/auth/forgot-password', {
			method: 'POST',
			body: JSON.stringify({ email }),
		});
	}
	resetPassword(token: string, password: string) {
		return fetch('/api/auth/reset-password', {
			method: 'POST',
			body: JSON.stringify({ token, password }),
		});
	}
	verifyEmail(token: string) {
		return fetch('/api/auth/verify-email', {
			method: 'POST',
			body: JSON.stringify({ token }),
		});
	}
}

export const pass = new User();
