import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logout } from './logout.js';
import { verify_access_token } from './jwt.js';

// Mock JWT verification
vi.mock('./jwt.js', () => ({
	verify_access_token: vi.fn(),
}));

describe('logout function', () => {
	let db: any;

	beforeEach(() => {
		vi.clearAllMocks();
		db = {};
	});

	it('should execute database delete operation to invalidate refresh token', async () => {
		// Arrange
		const mockRefreshToken = 'token123:hashedpart';
		const mockJwt = 'mock.jwt.token';
		const mockPayload = { sub: 'user123' };

		const mockExecute = vi.fn().mockResolvedValue(undefined);
		const mockWhere = vi.fn().mockReturnValue({ execute: mockExecute });
		const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

		db.delete = mockDelete;
		(verify_access_token as any).mockResolvedValue(mockPayload);

		// Act
		await logout(db, mockRefreshToken, mockJwt);

		// Assert
		expect(verify_access_token).toHaveBeenCalledWith(mockJwt);
		expect(db.delete).toHaveBeenCalled();
		expect(mockWhere).toHaveBeenCalled();
		expect(mockExecute).toHaveBeenCalled();
	});

	it('should handle database errors gracefully', async () => {
		// Arrange
		const mockRefreshToken = 'token123:hashedpart';
		const mockJwt = 'mock.jwt.token';
		const mockPayload = { sub: 'user123' };

		const mockExecute = vi.fn().mockRejectedValue(new Error('Database error'));
		const mockWhere = vi.fn().mockReturnValue({ execute: mockExecute });
		const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

		db.delete = mockDelete;
		(verify_access_token as any).mockResolvedValue(mockPayload);

		// Act & Assert
		await expect(logout(db, mockRefreshToken, mockJwt)).rejects.toThrow(
			'Logout failed: Unable to invalidate refresh token',
		);
		expect(mockExecute).toHaveBeenCalled();
	});

	it('should extract token ID correctly from refresh token', async () => {
		// Arrange
		const mockRefreshToken = 'token456:hashedpart';
		const mockJwt = 'mock.jwt.token';
		const mockPayload = { sub: 'user789' };

		const mockExecute = vi.fn().mockResolvedValue(undefined);
		const mockWhere = vi.fn().mockReturnValue({ execute: mockExecute });
		const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

		db.delete = mockDelete;
		(verify_access_token as any).mockResolvedValue(mockPayload);

		// Act
		await logout(db, mockRefreshToken, mockJwt);

		// Assert
		expect(verify_access_token).toHaveBeenCalledWith(mockJwt);
		expect(mockWhere).toHaveBeenCalledWith(
			expect.anything(), // The 'and' condition with token ID and user ID
		);
	});
});
