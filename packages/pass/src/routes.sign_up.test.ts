import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ensure DB module doesn't throw in tests (routes.ts imports db via other routes)
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';

// Mock sign_up used by the route
vi.mock('./sign_up.js', () => ({
  sign_up: vi.fn(),
}));

// Mock email sender to verify it's called and ensure non-blocking behavior
const pendingPromise = new Promise<void>(() => {}); // never resolves
vi.mock('./email.js', () => ({
  send_verification_email: vi.fn(() => pendingPromise),
}));

// Minimal cookie helper for tests
function createMockCookies() {
  return {
    serialize: vi.fn((name: string, value: string) => `${name}=${value}; Path=/; HttpOnly`),
  };
}

describe('sign_up_route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email or password is missing', async () => {
    const { sign_up_route } = await import('./routes.js');
    const event: any = { cookies: createMockCookies(), request: new Request('http://localhost') };

    const res1 = await sign_up_route(event, { email: 'test@example.com' } as any);
    expect(res1.status).toBe(400);

    const res2 = await sign_up_route(event, { password: 'password123' } as any);
    expect(res2.status).toBe(400);
  });

  it('sets cookies, returns success, and triggers verification email (non-blocking)', async () => {
    const { sign_up_route } = await import('./routes.js');
    const { sign_up } = await import('./sign_up.js');
    const { send_verification_email } = await import('./email.js');

    (sign_up as any).mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' },
      jwt: 'jwt-token',
      refresh_token: 'refresh-token',
    });

    const cookies = createMockCookies();
    const event: any = { cookies, request: new Request('http://localhost') };

    const res = await sign_up_route(event, { email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.jwt).toBe('jwt-token');
    expect(json.user).toEqual({ id: 'u1', email: 'test@example.com' });

    // Cookies set
    expect(cookies.serialize).toHaveBeenCalledWith('refresh_token', 'refresh-token', expect.any(Object));
    expect(cookies.serialize).toHaveBeenCalledWith('jwt', 'jwt-token', expect.any(Object));

    // Verification email triggered with correct user id
    expect(send_verification_email).toHaveBeenCalledWith('u1');
  });

  it('returns 400 when signup fails', async () => {
    const { sign_up_route } = await import('./routes.js');
    const { sign_up } = await import('./sign_up.js');

    (sign_up as any).mockResolvedValue(null);

    const event: any = { cookies: createMockCookies(), request: new Request('http://localhost') };
    const res = await sign_up_route(event, { email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Signup Failed');
  });
});
