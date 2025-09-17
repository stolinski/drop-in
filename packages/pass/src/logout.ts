import { and, eq } from 'drizzle-orm';
import { refresh_tokens } from './schema.js';
import { db } from './db.js';
import { verify_access_token } from './jwt.js';

export async function logout(refresh_token: string, jwt: string): Promise<void> {
	const token_id = refresh_token.split(':')[0];
	const payload = await verify_access_token(jwt);
	const user_id = payload.sub;

	try {
		await db
			.delete(refresh_tokens)
			.where(and(eq(refresh_tokens.id, token_id), eq(refresh_tokens.user_id, user_id)))
			.execute();
	} catch (error) {
		console.error('Failed to invalidate refresh token during logout:', error);
		throw new Error('Logout failed: Unable to invalidate refresh token');
	}
}
