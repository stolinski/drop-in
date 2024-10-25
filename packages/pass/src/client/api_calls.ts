class User {
	async login(email: string, password: string) {
		try {
			const formData = new FormData();
			formData.append('email', email);
			formData.append('password', password);
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				body: formData,
			});
			return res.json();
		} catch (e) {
			throw e;
		}
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
			console.log('res', res);
			return res.json();
		} catch (e) {
			throw e;
		}
	}
	async logout() {
		const res = await fetch('/api/auth/logout', {
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
