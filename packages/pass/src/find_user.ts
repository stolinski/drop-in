import { eq } from 'drizzle-orm';
import { refresh_tokens, user, User } from './schema.js';
import { db } from './db.js';

/**
 * Fetches all user data by their email. Do not use for
 *
 * @param email - The email of the user
 * @returns The user object if found, undefined otherwise
 */
export async function get_full_user_by_email(email: string): Promise<User | undefined> {
	return db.query.user.findFirst({
		where: eq(user.email, email),
	});
}

export async function get_user_by_email(
	email: string,
	full = false,
): Promise<Partial<User> | undefined> {
	const query: {
		where: ReturnType<typeof eq>;
		columns?: Partial<Record<keyof User, boolean>>;
	} = {
		where: eq(user.email, email),
	};
	if (!full) {
		query.columns = {
			id: true,
			email: true,
			created_at: true,
			updated_at: true,
			verified: true,
		};
	}
	return db.query.user.findFirst(query);
}

/**
 * Fetches a user by their ID.
 *
 * @param id - The ID of the user
 * @returns The user object if found, undefined otherwise
 */
export async function get_user_by_id(id: string | number): Promise<Partial<User> | undefined> {
	return db.query.user.findFirst({
		where: eq(user.id, id as any),
		columns: {
			id: true,
			email: true,
			created_at: true,
			updated_at: true,
			verified: true,
		},
	});
}

/**
 * Fetches a user by their refresh token.
 *
 * @param refresh_token - The refresh token
 * @returns The user object if found with a valid session, null otherwise
 */
export async function get_user_by_refresh_token(
	refresh_token: string,
): Promise<Partial<User> | null> {
	const result = await db.query.refresh_tokens.findFirst({
		where: eq(refresh_tokens.token, refresh_token),
		columns: {
			user_id: true,
		},
		with: {
			user: {
				columns: {
					id: true,
					email: true,
					verified: true,
					updated_at: true,
				},
			},
		},
	});

	return result?.user || null;
}
