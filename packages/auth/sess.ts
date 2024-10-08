import { and, eq } from 'drizzle-orm';
import { db } from '$src/hooks.server';
import { session, user } from '$src/schema';
import { decode_access_token } from './jwt';

export async function resume_session(access_token: string) {
	// Verify the access token with the environment tokenSecret
	// This decodes the jwt and gives us the userID
	const decoded_access_token = decode_access_token(access_token);
	const session_token = decoded_access_token.token;

	const session = await find_by_session_token(session_token);
	// If session exists and is valid,
	if (session) {
		// Gets the user based on the decoded id
		// Find the user by user id
		// Set user data
		return await db.query.user.findFirst({ where: eq(user.id, session.user_id) });
	}
}

type RefreshToken = {
	sessionToken: string;
	userId: string;
};

export function get_session_token_from_refresh_token(refreshToken: string): string {
	const decodedAccessToken = decode_access_token(refreshToken) as unknown as RefreshToken;
	return decodedAccessToken.sessionToken;
}

export function find_by_session_token(session_token: string) {
	return db.query.session.findFirst({ where: eq(session.session_token, session_token) });
}

export function delete_session(user_id: number, token_id: number) {
	return db.query.session.findFirst({
		where: and(eq(session.user_id, user_id), eq(session.id, token_id)),
	});
}
