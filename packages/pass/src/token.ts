import crypto from 'crypto';
import { db } from './db.js';
import { refresh_tokens } from './schema.js';
import { generate_token } from './utils.js';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import { cookie_options } from './cookies.js';

// Creates a refresh token record
export async function create_refresh_token(user_id: string): Promise<string> {
	const token_id = nanoid();
	const token_secret = generate_token();

	const refresh_token = `${token_id}:${token_secret}`;
	const hashed_token = crypto.createHash('sha256').update(token_secret).digest('hex');

	try {
		await db
			.insert(refresh_tokens)
			.values({
				id: token_id,
				user_id,
				token: hashed_token,
				expires_at: new Date(Date.now() + cookie_options.maxAge * 1000),
			})
			.execute();
	} catch (e) {
		throw new Error('Failed to create refresh token');
	}

	return refresh_token;
}

export async function delete_refresh_token(token_id: string): Promise<void> {
	try {
		await db.delete(refresh_tokens).where(eq(refresh_tokens.id, token_id));
	} catch (e) {
		throw new Error('Failed to delete refresh token');
	}
}

// Updates the refresh token expiration
export async function refresh_refresh_token(refresh_token: string): Promise<string> {
	const [token_id, token_secret] = refresh_token.split(':');
	if (!token_id || !token_secret) {
		throw new Error('Invalid refresh token');
	}

	await db
		.update(refresh_tokens)
		.set({ expires_at: new Date(Date.now() + cookie_options.maxAge * 1000) })
		.where(eq(refresh_tokens.id, token_id));

	return refresh_token;
}

// Verifies the refresh token, returns the user_id and email if valid
export async function verify_refresh_token(
	refresh_token: string,
): Promise<{ user_id: string } | null> {
	const [token_id, token_secret] = refresh_token.split(':');
	if (!token_id || !token_secret) {
		return null;
	}

	const hashed_token = crypto.createHash('sha256').update(token_secret).digest('hex');

	const [stored_token] = await db
		.select()
		.from(refresh_tokens)
		.where(and(eq(refresh_tokens.id, token_id), eq(refresh_tokens.token, hashed_token)));

	if (!stored_token) {
		return null;
	}

	const { expires_at, token, user_id } = stored_token;
	// Compare the hashes
	if (hashed_token !== token) {
		// Handle invalid token
		return null;
	}
	// Check for token expiration
	if (new Date() > expires_at) {
		// Handle expired token
		return null;
	}

	return { user_id };
}
