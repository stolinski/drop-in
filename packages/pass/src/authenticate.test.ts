import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authenticate_user } from './authenticate.js';

// Mock dependencies
const mockCookies = {
	get: vi.fn(),
	set: vi.fn(),
};

vi.mock('./jwt.js', () => ({
	create_jwt: vi.fn().mockResolvedValue('new-jwt-token'),
	verify_access_token: vi.fn(),
}));

vi.mock('./token.js', () => ({
	verify_refresh_token: vi.fn(),
	refresh_refresh_token: vi.fn().mockResolvedValue('refreshed-token'),
}));

vi.mock('./cookies.js', () => ({
	jwt_cookie_options: { httpOnly: true },
	cookie_options: { httpOnly: true },
}));

describe('authenticate_user', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should authenticate with valid JWT', async () => {
		const { verify_access_token } = await import('./jwt.js');
		
		mockCookies.get.mockImplementation((name: string) => {
			if (name === 'jwt') return 'valid-jwt-token';
			return undefined;
		});
		
		(verify_access_token as any).mockResolvedValue({
			sub: 'user123',
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes from now
		});

		const result = await authenticate_user(mockCookies as any);

		expect(result).toEqual({ user_id: 'user123' });
		expect(verify_access_token).toHaveBeenCalledWith('valid-jwt-token');
	});

	it('should fall back to refresh token when JWT is expired', async () => {
		const { verify_access_token } = await import('./jwt.js');
		const { verify_refresh_token } = await import('./token.js');
		
		mockCookies.get.mockImplementation((name: string) => {
			if (name === 'jwt') return 'expired-jwt-token';
			if (name === 'refresh_token') return 'valid-refresh-token';
			return undefined;
		});
		
		(verify_access_token as any).mockResolvedValue({
			sub: 'user123',
			iat: Math.floor(Date.now() / 1000) - 1000,
			exp: Math.floor(Date.now() / 1000) - 100, // Expired
		});
		
		(verify_refresh_token as any).mockResolvedValue({ user_id: 'user123' });

		const result = await authenticate_user(mockCookies as any);

		expect(result).toEqual({ user_id: 'user123' });
		expect(verify_refresh_token).toHaveBeenCalledWith('valid-refresh-token');
		expect(mockCookies.set).toHaveBeenCalledTimes(2); // Set new JWT and refresh token
	});

	it('should fall back to refresh token when JWT verification fails', async () => {
		const { verify_access_token } = await import('./jwt.js');
		const { verify_refresh_token } = await import('./token.js');
		
		mockCookies.get.mockImplementation((name: string) => {
			if (name === 'jwt') return 'invalid-jwt-token';
			if (name === 'refresh_token') return 'valid-refresh-token';
			return undefined;
		});
		
		(verify_access_token as any).mockRejectedValue(new Error('Invalid token'));
		(verify_refresh_token as any).mockResolvedValue({ user_id: 'user123' });

		const result = await authenticate_user(mockCookies as any);

		expect(result).toEqual({ user_id: 'user123' });
		expect(verify_refresh_token).toHaveBeenCalledWith('valid-refresh-token');
	});

	it('should return null when no tokens are present', async () => {
		mockCookies.get.mockReturnValue(undefined);

		const result = await authenticate_user(mockCookies as any);

		expect(result).toBeNull();
	});

	it('should return null when both tokens are invalid', async () => {
		const { verify_access_token } = await import('./jwt.js');
		const { verify_refresh_token } = await import('./token.js');
		
		mockCookies.get.mockImplementation((name: string) => {
			if (name === 'jwt') return 'invalid-jwt-token';
			if (name === 'refresh_token') return 'invalid-refresh-token';
			return undefined;
		});
		
		(verify_access_token as any).mockRejectedValue(new Error('Invalid token'));
		(verify_refresh_token as any).mockResolvedValue(null);

		const result = await authenticate_user(mockCookies as any);

		expect(result).toBeNull();
	});

	it('should handle missing JWT but valid refresh token', async () => {
		const { verify_refresh_token } = await import('./token.js');
		
		mockCookies.get.mockImplementation((name: string) => {
			if (name === 'refresh_token') return 'valid-refresh-token';
			return undefined;
		});
		
		(verify_refresh_token as any).mockResolvedValue({ user_id: 'user123' });

		const result = await authenticate_user(mockCookies as any);

		expect(result).toEqual({ user_id: 'user123' });
	});
});