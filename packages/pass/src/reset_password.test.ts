import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set JWT secret for token/digest generation
process.env.JWT_SECRET = 'test-secret-reset';

// Mocks
vi.mock('./find_user.js', () => ({
	get_full_user_by_email: vi.fn(),
}));

vi.mock('./email.js', () => ({
	send_reset_password_email: vi.fn(),
}));

vi.mock('./password.js', () => ({
	hash_n_salt_password: vi.fn().mockResolvedValue('new-hash'),
}));

vi.mock('./jwt.js', () => ({
	create_jwt: vi.fn().mockResolvedValue('jwt-token'),
}));

vi.mock('./token.js', () => ({
	create_refresh_token: vi.fn().mockResolvedValue('refresh-token'),
}));



describe('request_password_reset', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('sends reset email for existing user and valid email', async () => {
		const { request_password_reset } = await import('./reset_password.js');
		const { get_full_user_by_email } = await import('./find_user.js');
		const { send_reset_password_email } = await import('./email.js');

		(get_full_user_by_email as any).mockResolvedValue({ id: 'u1', email: 'test@example.com' });

		const db: any = {};
		await request_password_reset(db, 'Test@Example.com');

		expect(get_full_user_by_email).toHaveBeenCalledWith(db, 'test@example.com');
		expect(send_reset_password_email).toHaveBeenCalledWith('test@example.com');
	});

	it('silently resolves for non-existent user', async () => {
		const { request_password_reset } = await import('./reset_password.js');
		const { get_full_user_by_email } = await import('./find_user.js');
		const { send_reset_password_email } = await import('./email.js');

		(get_full_user_by_email as any).mockResolvedValue(null);

		const db: any = {};
		await expect(request_password_reset(db, 'nobody@example.com')).resolves.toBeUndefined();
		expect(send_reset_password_email).not.toHaveBeenCalled();
	});

	it('ignores invalid email formats', async () => {
		const { request_password_reset } = await import('./reset_password.js');
		const { get_full_user_by_email } = await import('./find_user.js');

		const db: any = {};
		await request_password_reset(db, 'invalid-email');
		expect(get_full_user_by_email).not.toHaveBeenCalled();
	});

	it('swallows internal errors to prevent enumeration', async () => {
		const { request_password_reset } = await import('./reset_password.js');
		const { get_full_user_by_email } = await import('./find_user.js');

		(get_full_user_by_email as any).mockRejectedValue(new Error('db failed'));

		const db: any = {};
		await expect(request_password_reset(db, 'test@example.com')).resolves.toBeUndefined();
	});
});

describe('reset_password', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns null for invalid email', async () => {
		const { reset_password } = await import('./reset_password.js');
		const db: any = {};
		const result = await reset_password(db, 'bad', 't', Date.now() + 1000, 'password123');
		expect(result).toBeNull();
	});

	it('returns null for invalid password', async () => {
		const { reset_password } = await import('./reset_password.js');
		const db: any = {};
		const result = await reset_password(db, 'test@example.com', 't', Date.now() + 1000, '123');
		expect(result).toBeNull();
	});

	it('returns null for mismatched token', async () => {
		const { reset_password } = await import('./reset_password.js');
		const expire = Date.now() + 1000 * 60;
		const db: any = {};
		const result = await reset_password(db, 'test@example.com', 'wrong-token', expire, 'password123');
		expect(result).toBeNull();
	});

	it('returns null for expired token', async () => {
		const { reset_password } = await import('./reset_password.js');
		const expire = Date.now() - 1000; // already expired
		// token matches but expired
		const { create_expiring_auth_digest } = await import('./utils.js');
		const token = create_expiring_auth_digest('test@example.com', expire);
		const db: any = {};
		const result = await reset_password(db, 'test@example.com', token, expire, 'password123');
		expect(result).toBeNull();
	});

	it('returns null when user not found', async () => {
		const { reset_password } = await import('./reset_password.js');
		const { get_full_user_by_email } = await import('./find_user.js');
		const expire = Date.now() + 1000 * 60;
		const { create_expiring_auth_digest } = await import('./utils.js');
		const token = create_expiring_auth_digest('test@example.com', expire);

		(get_full_user_by_email as any).mockResolvedValue(null);

		const db: any = {};
		const result = await reset_password(db, 'test@example.com', token, expire, 'password123');
		expect(result).toBeNull();
	});

	it('updates password, invalidates tokens, and returns new credentials', async () => {
		const { reset_password } = await import('./reset_password.js');
		const { get_full_user_by_email } = await import('./find_user.js');
		const db: any = {};
		const { create_expiring_auth_digest } = await import('./utils.js');
		const { hash_n_salt_password } = await import('./password.js');
		const { create_jwt } = await import('./jwt.js');
		const { create_refresh_token } = await import('./token.js');

		const expire = Date.now() + 1000 * 60;
		const email = 'User@Example.com';
		const normalized = 'user@example.com';
		const token = create_expiring_auth_digest(normalized, expire);

		(get_full_user_by_email as any).mockResolvedValue({
			id: 'user123',
			email: normalized,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			verified: true,
		});

		const updateExecute = vi.fn().mockResolvedValue(undefined);
		const updateWhere = vi.fn().mockReturnValue({ execute: updateExecute });
		const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
		(db.update as any) = vi.fn().mockReturnValue({ set: updateSet });

		const deleteExecute = vi.fn().mockResolvedValue(undefined);
		const deleteWhere = vi.fn().mockReturnValue({ execute: deleteExecute });
		(db.delete as any) = vi.fn().mockReturnValue({ where: deleteWhere });

		const result = await reset_password(db, email, token, expire, 'password123');

		expect(hash_n_salt_password).toHaveBeenCalledWith('password123');
		expect(updateSet).toHaveBeenCalled();
		expect(updateWhere).toHaveBeenCalled();
		expect(deleteWhere).toHaveBeenCalled();
		expect(deleteExecute).toHaveBeenCalled();
		expect(create_jwt).toHaveBeenCalledWith('user123');
		expect(create_refresh_token).toHaveBeenCalledWith(db, 'user123');
		expect(result).toEqual({
			user: expect.objectContaining({ id: 'user123', email: normalized }),
			jwt: 'jwt-token',
			refresh_token: 'refresh-token',
		});
	});
});
