import { cookie_options } from '$lib/const';
import type { Cookies } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import crypto, { randomBytes } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '$src/hooks.server';
import { user as schema_user, session, type User } from '$src/schema';
import { create_tokens, decode_access_token } from './jwt';

const { compare, genSalt, hash } = bcrypt;

/**
 * Authenticates a user based on their access and refresh tokens stored in cookies.
 *
 * @param cookies - The cookies object from the request
 * @returns An object containing the authenticated user (if any) and tokens
 */
export async function authenticate_user(cookies: Cookies) {
	// Start performance measurement
	const start = performance.now();

	// Extract tokens from cookies
	const access_token = cookies.get('accessToken');
	const refresh_token = cookies.get('refreshToken');

	let user: Partial<User> | null = null;
	let new_access_token = null;
	let new_refresh_token = null;

	// First, try to authenticate with the access token
	if (access_token) {
		try {
			// Decode the access token
			const decoded = decode_access_token(access_token);
			// Fetch user and their active session in one query
			user = await get_user_with_session(parseInt(decoded.user_id), decoded.token);

			if (user) {
				// If user is found, use the existing tokens
				new_access_token = access_token;
				new_refresh_token = refresh_token;
			}
		} catch (error) {
			console.error('Access token validation failed:', error);
			// Token validation failed, will fall through to refresh token
		}
	}

	// If access token failed, try to authenticate with the refresh token
	if (!user && refresh_token) {
		try {
			// Decode the refresh token
			const decoded = decode_access_token(refresh_token);

			// Fetch user by the session token stored in the refresh token
			user = await get_user_by_refresh_token(decoded.token);

			if (user?.id) {
				// If user is found, create new tokens
				const tokens = create_tokens({
					token: decoded.token,
					user_id: user.id,
				});
				new_access_token = tokens.accessToken;
				new_refresh_token = tokens.refreshToken;
			}
		} catch (error) {
			// console.error('Refresh token validation failed:', error);
			// Both token validations failed, user will remain null
		}
	}

	// Log performance metrics
	const end = performance.now();
	console.log(`Authentication took ${end - start} milliseconds`);

	// Return the authentication result
	return {
		user,
		access_token: new_access_token,
		refresh_token: new_refresh_token,
	};
}

/**
 * Fetches a user and their active session in a single query.
 *
 * @param user_id - The ID of the user to fetch
 * @param session_token - The session token to validate
 * @returns The user object if found with a valid session, null otherwise
 */
async function get_user_with_session(
	user_id: number,
	session_token: string,
): Promise<Partial<User> | null> {
	const result = await db.query.session.findFirst({
		where: and(eq(session.user_id, user_id), eq(session.session_token, session_token)),
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

/**
 * Fetches a user by their refresh token's session.
 *
 * @param session_token - The session token stored in the refresh token
 * @returns The user object if found with a valid session, null otherwise
 */
async function get_user_by_refresh_token(session_token: string): Promise<Partial<User> | null> {
	const result = await db.query.session.findFirst({
		where: eq(session.session_token, session_token),
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
// Given a 'password' from the client, extract the string that we should
// bcrypt. 'password' can be one of:
//  - String (the plaintext password)
//  - Object with 'digest' and 'algorithm' keys. 'algorithm' must be "sha-256".
export const getPasswordString = (password: string): string => {
	const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
	return passwordHash;
};

export const bcryptPassword = async (password: string): Promise<string> => {
	const salt = await genSalt(10);
	const hashedPassword = await hash(password, salt);
	return hashedPassword;
};

/**
 * @deprecated new auth service
 */
export const normalizeEmail = (email: string): string => {
	return decodeURIComponent(email).toLowerCase().trim();
};

// Compares password to hash to confirm they are the same
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const compared: boolean = await compare(password, hash);
	return compared;
}

/**
 * @deprecated new auth service
 */
export const generateRandomToken = (length = 43): string => randomBytes(length).toString('hex');

// Creates a session token & a valid Session
// Creates access and refresh token
export async function log_user_in({ user_id, cookies }: { user_id: number; cookies: Cookies }) {
	// Create Session Token
	const session_token = createSessionToken();
	// Creates a session in the database
	const session_data = await db
		.insert(session)
		.values({
			user_id,
			session_token,
		})
		.returning();

	// Create access and refresh tokens
	// These tokens contain the session token as well as the
	// accessToken has the userId
	const { accessToken, refreshToken } = create_tokens({
		token: session_token,
		user_id,
	});

	// Sets cookies for the response in the browser
	setAuthCookies({ accessToken, refreshToken, cookies });

	return {
		sessionId: session_data[0].id,
		tokens: {
			refreshToken,
			accessToken,
		},
		user_id,
	};
}

export function setAuthCookies({
	accessToken,
	refreshToken,
	cookies,
}: {
	accessToken: string;
	refreshToken: string;
	cookies: Cookies;
}) {
	cookies.set('accessToken', accessToken, cookie_options);
	cookies.set('refreshToken', refreshToken, cookie_options);
}
// Generates a token to be saved to the database to identify a session
export function createSessionToken() {
	return generateRandomToken();
}

/**
 * @deprecated new auth service
 */
export async function login_with_password(password: string, email: string) {
	// Finds user by email
	const user = await db.query.user.findFirst({
		where: eq(schema_user.email, email),
	});
	if (user) {
		// Compares password hash to one in database
		const compared: boolean = await authenticate_user_password(password, user?.hashed_password);
		if (compared) {
			return user;
		}
	}
}

// Takes a user and a pw string and gives you a boolean if
// the password matches the one in the database
export async function authenticate_user_password(
	password: string,
	user_pw: string,
): Promise<boolean> {
	// Gets password hash from plain text password
	const formattedPassword = getPasswordString(password);

	if (!user_pw) return false;
	if (user_pw) {
		// Compares password hash to one in database
		const compared: boolean = await verifyPassword(formattedPassword, user_pw);

		if (compared) {
			// Returns boolean if the user password is accurate
			return compared;
		}
	}
	return false;
}
