import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { refresh_tokens, user, type User } from './schema.js';
import { get_full_user_by_email } from './find_user.js';
import { create_jwt } from './jwt.js';
import { hash_n_salt_password } from './password.js';
import { check_is_password_valid, create_expiring_auth_digest, is_valid_email, normalize_email } from './utils.js';
import { create_refresh_token } from './token.js';
import { send_reset_password_email } from './email.js';

/**
 * Initiates a password reset by sending a reset email if the user exists.
 * Always resolves successfully to avoid user enumeration.
 */
export async function request_password_reset(email: string): Promise<void> {
	const normalized = normalize_email(email);
	if (!is_valid_email(normalized)) return; // Silently ignore invalid emails

	try {
		const existing = await get_full_user_by_email(normalized);
		if (!existing) return; // Do not reveal user existence
		await send_reset_password_email(normalized);
	} catch (e) {
		// Intentionally swallow errors to avoid leaking information
		console.error('request_password_reset error (suppressed):', e);
	}
}

export type ResetPasswordResult = {
	user: Partial<User>;
	jwt: string;
	refresh_token: string;
};

/**
 * Completes password reset after verifying the provided token, email and expiry.
 * On success, updates the password, invalidates existing refresh tokens and signs in the user.
 */
export async function reset_password(
	email: string,
	token: string,
	expire: number,
	new_password: string,
): Promise<ResetPasswordResult | null> {
	const normalized = normalize_email(email);
	if (!is_valid_email(normalized)) return null;
	if (!check_is_password_valid(new_password)) return null;

	// Validate token
	const expected = create_expiring_auth_digest(normalized, Number(expire));
	if (token !== expected) return null;
	if (Date.now() > Number(expire)) return null;

	const existing = await get_full_user_by_email(normalized);
	if (!existing?.id) return null;

	// Hash the new password
	const new_hash = await hash_n_salt_password(new_password);

	// Update password
	await db.update(user).set({ password_hash: new_hash }).where(eq(user.id, existing.id)).execute();

	// Invalidate all existing refresh tokens for this user
	try {
		await db.delete(refresh_tokens).where(eq(refresh_tokens.user_id, existing.id)).execute();
	} catch (e) {
		console.warn('Failed to invalidate existing refresh tokens on password reset:', e);
	}

	// Sign in: new jwt and refresh token
	const jwt = await create_jwt(existing.id);
	const refresh_token = await create_refresh_token(existing.id);

	const public_user: Partial<User> = {
		id: existing.id,
		email: existing.email,
		created_at: existing.created_at,
		updated_at: existing.updated_at,
		verified: existing.verified,
	};

	return { user: public_user, jwt, refresh_token };
}
