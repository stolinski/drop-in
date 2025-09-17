import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create_jwt, verify_access_token } from './jwt.js';

// Mock environment variable
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';

describe('JWT utilities', () => {
	describe('create_jwt', () => {
		it('should create a valid JWT', async () => {
			const userId = 'test-user-123';
			const jwt = await create_jwt(userId);
			
			expect(jwt).toBeDefined();
			expect(typeof jwt).toBe('string');
			expect(jwt.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
		});

		it('should create different JWTs for different users', async () => {
			const jwt1 = await create_jwt('user1');
			const jwt2 = await create_jwt('user2');
			
			expect(jwt1).not.toBe(jwt2);
		});
	});

	describe('verify_access_token', () => {
		it('should verify a valid JWT', async () => {
			const userId = 'test-user-123';
			const jwt = await create_jwt(userId);
			
			const payload = await verify_access_token(jwt);
			
			expect(payload).toBeDefined();
			expect(payload.sub).toBe(userId);
			expect(payload.iat).toBeDefined();
			expect(typeof payload.iat).toBe('number');
		});

		it('should reject invalid JWT', async () => {
			const invalidJwt = 'invalid.jwt.token';
			
			await expect(verify_access_token(invalidJwt)).rejects.toThrow();
		});

		it('should reject JWT with wrong secret', async () => {
			// Create JWT with one secret
			const jwt = await create_jwt('user123');
			
			// Change secret and try to verify
			process.env.JWT_SECRET = 'different-secret';
			
			await expect(verify_access_token(jwt)).rejects.toThrow();
			
			// Restore secret
			process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
		});

		it('should include expiration in payload', async () => {
			const jwt = await create_jwt('user123');
			const payload = await verify_access_token(jwt);
			
			expect(payload.exp).toBeDefined();
			expect(typeof payload.exp).toBe('number');
			expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000)); // Should be in future
		});
	});
});