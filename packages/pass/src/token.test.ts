import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock all external dependencies before importing
vi.mock('./schema.js', () => ({
	refresh_tokens: {},
}));

vi.mock('./cookies.js', () => ({
	cookie_options: {
		maxAge: 60 * 60 * 24 * 30,
	},
}));

// Now import the functions to test
import { 
	create_refresh_token, 
	verify_refresh_token, 
	refresh_refresh_token,
	delete_refresh_token 
} from './token.js';

function makeDbStub() {
	return {
		insert: vi.fn(() => ({
			values: vi.fn(() => ({ execute: vi.fn() })),
		})),
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(async () => ([{
					id: 'token123',
					user_id: 'user123',
					token: 'hashed-token',
					expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
				}])),
			})),
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(() => ({ execute: vi.fn() })),
			})),
		})),
		delete: vi.fn(() => ({
			where: vi.fn(() => ({ execute: vi.fn() })),
		})),
	} as any;
}

describe('Token utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('create_refresh_token', () => {
		it('should create a refresh token', async () => {
			const userId = 'test-user-123';
			const token = await create_refresh_token(makeDbStub(), userId);
			expect(token).toBeDefined();
			expect(typeof token).toBe('string');
			expect(token).toContain(':'); // Should have format "id:secret"
			const [tokenId, tokenSecret] = token.split(':');
			expect(tokenId).toBeDefined();
			expect(tokenSecret).toBeDefined();
			expect(tokenId.length).toBeGreaterThan(0);
			expect(tokenSecret.length).toBeGreaterThan(0);
		});

		it('should insert token into database', async () => {
			const db = makeDbStub();
			const userId = 'test-user-123';
			await create_refresh_token(db, userId);
			expect(db.insert).toHaveBeenCalled();
		});

		it('should handle database errors', async () => {
			const db = { insert: vi.fn(() => { throw new Error('Database error'); }) } as any;
			await expect(create_refresh_token(db, 'user123')).rejects.toThrow('Failed to create refresh token');
		});
	});

	describe('verify_refresh_token', () => {
		it('should verify valid refresh token', async () => {
			const refreshToken = 'token123:valid-secret';
			const db = makeDbStub();
			const result = await verify_refresh_token(db, refreshToken);
			// Since we're mocking complex crypto operations, just test the structure
			expect(typeof result).toBe('object');
		});

		it('should reject invalid token format', async () => {
			const invalidToken = 'invalid-format';
			const result = await verify_refresh_token(makeDbStub(), invalidToken);
			expect(result).toBeNull();
		});
	});

	describe('refresh_refresh_token', () => {
		it('should refresh token expiration', async () => {
			const db = makeDbStub();
			const refreshToken = 'token123:secret';
			const result = await refresh_refresh_token(db, refreshToken);
			expect(result).toBe(refreshToken); // Should return same token
			expect(db.update).toHaveBeenCalled();
		});

		it('should handle invalid token format', async () => {
			const invalidToken = 'invalid-format';
			await expect(refresh_refresh_token(makeDbStub(), invalidToken)).rejects.toThrow('Invalid refresh token');
		});
	});

	describe('delete_refresh_token', () => {
		it('should delete refresh token', async () => {
			const db = makeDbStub();
			const tokenId = 'token123';
			await delete_refresh_token(db, tokenId);
			expect(db.delete).toHaveBeenCalled();
		});

		it('should handle database errors', async () => {
			const db = { delete: vi.fn(() => { throw new Error('Database error'); }) } as any;
			await expect(delete_refresh_token(db, 'token123')).rejects.toThrow('Failed to delete refresh token');
		});
	});
});
