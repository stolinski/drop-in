import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
	normalize_email, 
	is_valid_email, 
	check_is_password_valid,
	create_expiring_auth_digest,
	generate_token,
	sha256
} from './utils.js';

// Mock environment for JWT_SECRET
process.env.JWT_SECRET = 'test-secret-for-utils';

describe('Utility functions', () => {
	describe('normalize_email', () => {
		it('should convert email to lowercase', () => {
			expect(normalize_email('TEST@EXAMPLE.COM')).toBe('test@example.com');
		});

		it('should trim whitespace', () => {
			expect(normalize_email('  test@example.com  ')).toBe('test@example.com');
		});

		it('should decode URI components', () => {
			expect(normalize_email('test%40example.com')).toBe('test@example.com');
		});
	});

	describe('is_valid_email', () => {
		it('should validate correct emails', () => {
			expect(is_valid_email('test@example.com')).toBe(true);
			expect(is_valid_email('user.name@domain.co.uk')).toBe(true);
			expect(is_valid_email('a@b')).toBe(true); // Minimal valid format
		});

		it('should reject invalid emails', () => {
			expect(is_valid_email('invalid-email')).toBe(false);
			expect(is_valid_email('missing@')).toBe(false);
			expect(is_valid_email('@missing-local')).toBe(false);
			expect(is_valid_email('')).toBe(false);
		});

		it('should reject non-string inputs', () => {
			expect(is_valid_email(null)).toBe(false);
			expect(is_valid_email(undefined)).toBe(false);
			expect(is_valid_email(123)).toBe(false);
			expect(is_valid_email({})).toBe(false);
		});

		it('should reject emails that are too long', () => {
			const longEmail = 'a'.repeat(250) + '@example.com';
			expect(is_valid_email(longEmail)).toBe(false);
		});
	});

	describe('check_is_password_valid', () => {
		it('should validate correct passwords', () => {
			expect(check_is_password_valid('password123')).toBe(true);
			expect(check_is_password_valid('123456')).toBe(true); // Minimum length
			expect(check_is_password_valid('a'.repeat(255))).toBe(true); // Maximum length
		});

		it('should reject invalid passwords', () => {
			expect(check_is_password_valid('12345')).toBe(false); // Too short
			expect(check_is_password_valid('a'.repeat(256))).toBe(false); // Too long
			expect(check_is_password_valid('')).toBe(false); // Empty
		});

		it('should reject non-string inputs', () => {
			expect(check_is_password_valid(null as any)).toBe(false);
			expect(check_is_password_valid(undefined as any)).toBe(false);
			expect(check_is_password_valid(123 as any)).toBe(false);
		});
	});

	describe('create_expiring_auth_digest', () => {
		it('should create consistent digest for same inputs', () => {
			const email = 'test@example.com';
			const timestamp = 1234567890;
			
			const digest1 = create_expiring_auth_digest(email, timestamp);
			const digest2 = create_expiring_auth_digest(email, timestamp);
			
			expect(digest1).toBe(digest2);
			expect(typeof digest1).toBe('string');
			expect(digest1.length).toBe(64); // SHA-256 hex string length
		});

		it('should create different digests for different emails', () => {
			const timestamp = 1234567890;
			
			const digest1 = create_expiring_auth_digest('test1@example.com', timestamp);
			const digest2 = create_expiring_auth_digest('test2@example.com', timestamp);
			
			expect(digest1).not.toBe(digest2);
		});

		it('should create different digests for different timestamps', () => {
			const email = 'test@example.com';
			
			const digest1 = create_expiring_auth_digest(email, 1234567890);
			const digest2 = create_expiring_auth_digest(email, 1234567891);
			
			expect(digest1).not.toBe(digest2);
		});
	});

	describe('generate_token', () => {
		it('should generate token with default length', () => {
			const token = generate_token();
			
			expect(typeof token).toBe('string');
			expect(token.length).toBe(64); // 32 bytes = 64 hex characters
		});

		it('should generate token with custom length', () => {
			const token = generate_token(16);
			
			expect(typeof token).toBe('string');
			expect(token.length).toBe(32); // 16 bytes = 32 hex characters
		});

		it('should generate different tokens', () => {
			const token1 = generate_token();
			const token2 = generate_token();
			
			expect(token1).not.toBe(token2);
		});

		it('should only contain hex characters', () => {
			const token = generate_token();
			const hexPattern = /^[a-f0-9]+$/;
			
			expect(hexPattern.test(token)).toBe(true);
		});
	});

	describe('sha256', () => {
		it('should create consistent hash for same input', () => {
			const input = 'test-password';
			
			const hash1 = sha256(input);
			const hash2 = sha256(input);
			
			expect(hash1).toBe(hash2);
			expect(typeof hash1).toBe('string');
			expect(hash1.length).toBe(64); // SHA-256 hex string length
		});

		it('should create different hashes for different inputs', () => {
			const hash1 = sha256('password1');
			const hash2 = sha256('password2');
			
			expect(hash1).not.toBe(hash2);
		});

		it('should only contain hex characters', () => {
			const hash = sha256('test');
			const hexPattern = /^[a-f0-9]+$/;
			
			expect(hexPattern.test(hash)).toBe(true);
		});
	});
});