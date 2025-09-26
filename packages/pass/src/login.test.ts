import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login } from './login.js';

// Mock dependencies
vi.mock('./find_user.js', () => ({
	get_full_user_by_email: vi.fn(),
}));

vi.mock('./password.js', () => ({
	verify_password: vi.fn(),
}));

vi.mock('./jwt.js', () => ({
	create_jwt: vi.fn().mockResolvedValue('jwt-token'),
}));

vi.mock('./token.js', () => ({
	create_refresh_token: vi.fn().mockResolvedValue('refresh-token'),
}));

describe('login', () => {
	let db: any;

	beforeEach(() => {
		vi.clearAllMocks();
		db = {};
	});

	it('should login user with correct credentials', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { verify_password } = await import('./password.js');
		
		const mockUser = {
			id: 'user123',
			email: 'test@example.com',
			password_hash: 'hashed-password',
			verified: true,
		};

		(get_full_user_by_email as any).mockResolvedValue(mockUser);
		(verify_password as any).mockResolvedValue(true);

		const result = await login(db, 'test@example.com', 'password123');

		expect(result).toBeDefined();
		expect(result?.user).toBe(mockUser);
		expect(result?.jwt).toBe('jwt-token');
		expect(result?.refresh_token).toBe('refresh-token');
		// Ensure DI was used by dependent functions
		expect(get_full_user_by_email).toHaveBeenCalledWith(db, 'test@example.com');
		expect(verify_password).toHaveBeenCalledWith(db, 'password123', 'hashed-password', 'user123');
	});

	it('should return null for non-existent user', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		
		(get_full_user_by_email as any).mockResolvedValue(null);

		const result = await login(db, 'nonexistent@example.com', 'password123');

		expect(result).toBeNull();
	});

	it('should return null for incorrect password', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { verify_password } = await import('./password.js');
		
		const mockUser = {
			id: 'user123',
			email: 'test@example.com',
			password_hash: 'hashed-password',
			verified: true,
		};

		(get_full_user_by_email as any).mockResolvedValue(mockUser);
		(verify_password as any).mockResolvedValue(false);

		const result = await login(db, 'test@example.com', 'wrongpassword');

		expect(result).toBeNull();
	});

	it('should handle database errors gracefully', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		
		(get_full_user_by_email as any).mockRejectedValue(new Error('Database error'));

		await expect(login(db, 'test@example.com', 'password123')).rejects.toThrow('Database error');
	});

	it('should handle JWT creation errors', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { verify_password } = await import('./password.js');
		const { create_jwt } = await import('./jwt.js');
		
		const mockUser = {
			id: 'user123',
			email: 'test@example.com',
			password_hash: 'hashed-password',
			verified: true,
		};

		(get_full_user_by_email as any).mockResolvedValue(mockUser);
		(verify_password as any).mockResolvedValue(true);
		(create_jwt as any).mockRejectedValue(new Error('JWT creation failed'));

		await expect(login(db, 'test@example.com', 'password123')).rejects.toThrow('JWT creation failed');
	});

	it('should handle refresh token creation errors', async () => {
		const { get_full_user_by_email } = await import('./find_user.js');
		const { verify_password } = await import('./password.js');
		const { create_refresh_token } = await import('./token.js');
		
		const mockUser = {
			id: 'user123',
			email: 'test@example.com',
			password_hash: 'hashed-password',
			verified: true,
		};

		(get_full_user_by_email as any).mockResolvedValue(mockUser);
		(verify_password as any).mockResolvedValue(true);
		(create_refresh_token as any).mockRejectedValue(new Error('Token creation failed'));

		await expect(login(db, 'test@example.com', 'password123')).rejects.toThrow();
	});
});
