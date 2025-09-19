import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ensure DB module doesn't throw in tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';

// Mock reset password module used by routes
vi.mock('./reset_password.js', () => ({
	request_password_reset: vi.fn(),
	reset_password: vi.fn(),
}));

// Minimal cookie helper for tests
function createMockCookies() {
	return {
		get: vi.fn(),
		serialize: vi.fn((name: string, value: string) => `${name}=${value}; Path=/; HttpOnly`),
	};
}

describe('forgot_password_route', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 when email is missing', async () => {
		const { forgot_password_route } = await import('./routes.js');
		const event: any = { cookies: createMockCookies() };

		const res = await forgot_password_route(event, {} as any);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toBe('Email is required');
	});

	it('returns 200 and triggers password reset without leaking existence', async () => {
		const { forgot_password_route } = await import('./routes.js');
		const { request_password_reset } = await import('./reset_password.js');
		const event: any = { cookies: createMockCookies() };

		const res = await forgot_password_route(event, { email: 'test@example.com' });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe('success');
		expect(request_password_reset).toHaveBeenCalledWith('test@example.com');
	});
});

describe('reset_password_route', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 when required fields are missing', async () => {
		const { reset_password_route } = await import('./routes.js');
		const event: any = { cookies: createMockCookies() };

		const res = await reset_password_route(event, { email: 'a@example.com' } as any);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toBe('Missing required fields');
	});

	it('returns 400 when reset_password fails', async () => {
		const { reset_password_route } = await import('./routes.js');
		const { reset_password } = await import('./reset_password.js');
		(reset_password as any).mockResolvedValue(null);
		const event: any = { cookies: createMockCookies() };

		const res = await reset_password_route(event, {
			email: 'test@example.com',
			token: 't',
			expire: Date.now() + 1000,
			password: 'password123',
		});

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toBe('Password reset failed');
	});

	it('sets cookies and returns success on valid reset', async () => {
		const { reset_password_route } = await import('./routes.js');
		const { reset_password } = await import('./reset_password.js');
		const cookies = createMockCookies();
		const event: any = { cookies };

		(reset_password as any).mockResolvedValue({
			user: { id: 'u1', email: 'test@example.com' },
			jwt: 'jwt-token',
			refresh_token: 'refresh-token',
		});

		const res = await reset_password_route(event, {
			email: 'test@example.com',
			token: 't',
			expire: Date.now() + 1000,
			password: 'password123',
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.status).toBe('success');
		expect(json.jwt).toBe('jwt-token');
		expect(json.user).toEqual({ id: 'u1', email: 'test@example.com' });

		// Two cookies: refresh_token and jwt
		expect(cookies.serialize).toHaveBeenCalledWith('refresh_token', 'refresh-token', expect.any(Object));
		expect(cookies.serialize).toHaveBeenCalledWith('jwt', 'jwt-token', expect.any(Object));
	});
});
