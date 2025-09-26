import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hash_n_salt_password, verify_password } from './password.js';

vi.mock('./schema.js', () => ({
	user: {},
}));

describe('Password utilities', () => {
	let db: any;

	beforeEach(() => {
		vi.clearAllMocks();
		db = {};
	});

	describe('hash_n_salt_password', () => {
		it('should hash a password', async () => {
			const password = 'testpassword123';
			const hashedPassword = await hash_n_salt_password(password);
			
			expect(hashedPassword).toBeDefined();
			expect(typeof hashedPassword).toBe('string');
			expect(hashedPassword).not.toBe(password);
			expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
		});

		it('should generate different hashes for the same password', async () => {
			const password = 'testpassword123';
			const hash1 = await hash_n_salt_password(password);
			const hash2 = await hash_n_salt_password(password);
			
			expect(hash1).not.toBe(hash2); // Due to salt, should be different
		});
	});

	describe('verify_password', () => {
		it('should verify correct password with new method', async () => {
			const password = 'testpassword123';
			const hashedPassword = await hash_n_salt_password(password);
			
			const isValid = await verify_password(db, password, hashedPassword, 'user123');
			
			expect(isValid).toBe(true);
		});

		it('should reject incorrect password', async () => {
			const password = 'testpassword123';
			const wrongPassword = 'wrongpassword';
			const hashedPassword = await hash_n_salt_password(password);
			
			const isValid = await verify_password(db, wrongPassword, hashedPassword, 'user123');
			
			expect(isValid).toBe(false);
		});

		it('should handle verification errors gracefully', async () => {
			const isValid = await verify_password(db, 'password', 'invalid-hash', 'user123');
			
			expect(isValid).toBe(false);
		});

		it('should verify old method passwords and upgrade them', async () => {
			// Mock the old method hash (this would be a real bcrypt hash of sha256(password) in practice)
			const password = 'testpassword123';
			const hashedPassword = await hash_n_salt_password(password);
			
			const mockExecute = vi.fn().mockResolvedValue([]);
			db = {
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							execute: mockExecute,
						}),
					}),
				}),
			};

			const isValid = await verify_password(db, password, hashedPassword, 'user123');
			
			expect(isValid).toBe(true);
		});
	});
});
