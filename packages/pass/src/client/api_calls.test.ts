import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { pass } from './api_calls.js';

// Mock fetch
const mockFetch = vi.fn();
// @ts-ignore
global.fetch = mockFetch;

describe('pass.logout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should send logout request with credentials', async () => {
		// Arrange
		const mockResponse = {
			ok: true,
			status: 200,
		};
		mockFetch.mockResolvedValue(mockResponse);

		// Act
		const result = await pass.logout();

		// Assert
		expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
			method: 'POST',
			credentials: 'include',
		});
		expect(result).toBe(mockResponse);
	});

	it('should handle logout server errors', async () => {
		// Arrange
		const mockResponse = {
			ok: false,
			status: 500,
		};
		mockFetch.mockResolvedValue(mockResponse);

		// Act
		const result = await pass.logout();

		// Assert
		expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
			method: 'POST',
			credentials: 'include',
		});
		expect(result).toBe(mockResponse);
	});

	it('should handle network errors gracefully', async () => {
		// Arrange
		const networkError = new Error('Network error');
		mockFetch.mockRejectedValue(networkError);

		// Act & Assert
		await expect(pass.logout()).rejects.toThrow('Network error');
	});
});

describe('pass.requestPasswordReset', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should POST to /api/auth/forgot-password', async () => {
		const mockResponse = { ok: true, status: 200 };
		mockFetch.mockResolvedValue(mockResponse);

		const res = await pass.requestPasswordReset('test@example.com');

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const [url, options] = mockFetch.mock.calls[0];
		expect(url).toBe('/api/auth/forgot-password');
		expect(options.method).toBe('POST');
		expect(options.body).toBeInstanceOf(FormData);
		expect(res).toBe(mockResponse);
	});
});

describe('pass.resetPassword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should POST to /api/auth/reset-password with credentials included', async () => {
		const mockResponse = { ok: true, status: 200 };
		mockFetch.mockResolvedValue(mockResponse);

		const now = Date.now() + 1000;
		const res = await pass.resetPassword('test@example.com', 'token', now, 'password123');

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const [url, options] = mockFetch.mock.calls[0];
		expect(url).toBe('/api/auth/reset-password');
		expect(options.method).toBe('POST');
		expect(options.credentials).toBe('include');
		expect(options.body).toBeInstanceOf(FormData);
		expect(res).toBe(mockResponse);
	});
});
