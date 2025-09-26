import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock all external dependencies before importing
vi.mock('./find_user.js', () => ({
	get_full_user_by_email: vi.fn(),
}));

vi.mock('./password.js', () => ({
	hash_n_salt_password: vi.fn().mockResolvedValue('hashed-password'),
}));

vi.mock('./jwt.js', () => ({
	create_jwt: vi.fn().mockResolvedValue('jwt-token'),
}));

vi.mock('./token.js', () => ({
	create_refresh_token: vi.fn().mockResolvedValue('refresh-token'),
}));

vi.mock('./utils.js', () => ({
	normalize_email: vi.fn((email) => email.toLowerCase()),
	is_valid_email: vi.fn(() => true),
	check_is_password_valid: vi.fn(() => true),
}));

vi.mock('./schema.js', () => ({
	user: {},
}));

// Now import the function to test
import { sign_up } from './sign_up.js';

function makeDbStub() {
	const returning = vi.fn(async () => [
		{
			id: 'user123',
			email: 'test@example.com',
			verified: false,
		},
	]);
	const values = vi.fn(() => ({ returning }));
	const insert = vi.fn(() => ({ values }));
	return { insert } as any;
}

describe('sign_up', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create new user with valid data', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		(get_full_user_by_email as any).mockResolvedValue(null); // User doesn't exist

		const db = makeDbStub();
		const result = await sign_up(db, 'test@example.com', 'password123');

		expect(result).toBeDefined();
		expect(result?.user.id).toBe('user123');
		expect(result?.user.email).toBe('test@example.com');
		expect(result?.jwt).toBe('jwt-token');
		expect(result?.refresh_token).toBe('refresh-token');
	});

	it('should reject invalid email', async () => {
		const { is_valid_email } = await import('./utils.js');
		(is_valid_email as any).mockReturnValue(false);

		await expect(sign_up({} as any, 'invalid-email', 'password123')).rejects.toThrow('Invalid email');
	});

	it('should reject invalid password', async () => {
		const { is_valid_email, check_is_password_valid } = await import('./utils.js');
		(is_valid_email as any).mockReturnValue(true);
		(check_is_password_valid as any).mockReturnValue(false);

		await expect(sign_up({} as any, 'test@example.com', '123')).rejects.toThrow('Invalid password');
	});

	it('should reject existing user', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { is_valid_email, check_is_password_valid } = await import('./utils.js');
		(is_valid_email as any).mockReturnValue(true);
		(check_is_password_valid as any).mockReturnValue(true);
		const existingUser = { id: 'existing123', email: 'test@example.com' };
		(get_full_user_by_email as any).mockResolvedValue(existingUser);

		await expect(sign_up({} as any, 'test@example.com', 'password123')).rejects.toThrow('User already exists');
	});

	it('should handle database insertion errors', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { is_valid_email, check_is_password_valid } = await import('./utils.js');
		(is_valid_email as any).mockReturnValue(true);
		(check_is_password_valid as any).mockReturnValue(true);
		(get_full_user_by_email as any).mockResolvedValue(null);

		const db = { insert: vi.fn(() => { throw new Error('Database error'); }) } as any;

		await expect(sign_up(db, 'test@example.com', 'password123')).rejects.toThrow('Database error');
	});

	it('should handle password hashing errors', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { hash_n_salt_password } = await import('./password.js');
		const { is_valid_email, check_is_password_valid } = await import('./utils.js');
		(is_valid_email as any).mockReturnValue(true);
		(check_is_password_valid as any).mockReturnValue(true);
		(get_full_user_by_email as any).mockResolvedValue(null);
		(hash_n_salt_password as any).mockRejectedValue(new Error('Hashing failed'));

		await expect(sign_up({} as any, 'test@example.com', 'password123')).rejects.toThrow('Hashing failed');
	});

	it('should normalize email before processing', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { normalize_email, is_valid_email, check_is_password_valid } = await import('./utils.js');
		const { hash_n_salt_password } = await import('./password.js');
		(is_valid_email as any).mockReturnValue(true);
		(check_is_password_valid as any).mockReturnValue(true);
		(get_full_user_by_email as any).mockResolvedValue(null);
		(normalize_email as any).mockReturnValue('test@example.com');
		(hash_n_salt_password as any).mockResolvedValue('hashed-password');

		await sign_up(makeDbStub(), 'TEST@EXAMPLE.COM', 'password123');

		expect(normalize_email).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
	});
});
