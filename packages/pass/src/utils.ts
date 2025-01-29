import crypto from 'crypto';

export function normalize_email(email: string): string {
	return decodeURIComponent(email).toLowerCase().trim();
}

export function is_valid_email(maybeEmail: unknown): maybeEmail is string {
	if (typeof maybeEmail !== 'string') return false;
	if (maybeEmail.length > 255) return false;
	const emailRegexp = /^.+@.+$/; // [one or more character]@[one or more character]
	return emailRegexp.test(maybeEmail);
}

export function check_is_password_valid(password: string): boolean {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}

export function create_expiring_auth_digest(email: string, expirationTimestamp: number) {
	const authString = `${drop_in_config.auth.jwt_secret}:${email}:${expirationTimestamp}`;
	return crypto.createHash('sha256').update(authString).digest('hex');
}

export function generate_token(length: number = 32) {
	return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a password using SHA-256 and returns the hexadecimal string.
 *
 * @param password - The plaintext password to hash.
 * @returns The SHA-256 hash of the password as a hex string.
 */
export function sha256(password: string): string {
	return crypto.createHash('sha256').update(password).digest('hex');
}
