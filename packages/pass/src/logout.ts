import { and, eq } from 'drizzle-orm';
import { refresh_tokens } from './schema';
import { db } from './db';
import { verify_access_token } from './jwt';

export async function logout(refresh_token: string, jwt: string): Promise<void> {
	const token_id = refresh_token.split(':')[0];
	const payload = await verify_access_token(jwt);
	const user_id = payload.sub;

	db.delete(refresh_tokens).where(
		and(eq(refresh_tokens.id, token_id), eq(refresh_tokens.user_id, user_id)),
	);
	return;
}
