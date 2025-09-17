import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { pass } from './api_calls.js';

// Mock fetch
const mockFetch = vi.fn();
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
