import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logout } from './logout.js';
import { db } from './db.js';
import { verify_access_token } from './jwt.js';

// Mock the database and JWT verification
vi.mock('./db.js', () => ({
	db: {
		delete: vi.fn(() => ({
			where: vi.fn(() => ({
				execute: vi.fn(),
			})),
		})),
	},
}));

vi.mock('./jwt.js', () => ({
	verify_access_token: vi.fn(),
}));

describe('logout function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should execute database delete operation to invalidate refresh token', async () => {
		// Arrange
		const mockRefreshToken = 'token123:hashedpart';
		const mockJwt = 'mock.jwt.token';
		const mockPayload = { sub: 'user123' };

		const mockExecute = vi.fn().mockResolvedValue(undefined);
		const mockWhere = vi.fn().mockReturnValue({ execute: mockExecute });
		const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

		(db.delete as any) = mockDelete;
		(verify_access_token as any).mockResolvedValue(mockPayload);

		// Act
		await logout(mockRefreshToken, mockJwt);

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

		(db.delete as any) = mockDelete;
		(verify_access_token as any).mockResolvedValue(mockPayload);

		// Act & Assert
		await expect(logout(mockRefreshToken, mockJwt)).rejects.toThrow(
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

		(db.delete as any) = mockDelete;
		(verify_access_token as any).mockResolvedValue(mockPayload);

		// Act
		await logout(mockRefreshToken, mockJwt);

		// Assert
		expect(verify_access_token).toHaveBeenCalledWith(mockJwt);
		expect(mockWhere).toHaveBeenCalledWith(
			expect.anything(), // The 'and' condition with token ID and user ID
		);
	});
});
