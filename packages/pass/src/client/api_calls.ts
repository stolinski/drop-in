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
		});
	}
}

export const pass = new User();
