import { get_full_user_by_email } from './find_user.js';
import { verify_password } from './password.js';
import { create_jwt } from './jwt.js';
import { User } from './schema.js';
import { create_refresh_token } from './token.js';
/**
 * Logs in a user with the given email and password.
 *
 * @param db - Drizzle instance
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The user object, JWT, and refresh token if successful, null otherwise
 */
export async function login(
	db: any,
	email: string,
	password: string,
): Promise<{
	user: Partial<User>;
	jwt: string;
	refresh_token: string;
} | null> {
	try {
		// Check if a user exists with that email
		const user = await get_full_user_by_email(db, email);

		if (!user) {
			console.log('User not found');
			return null;
		}

		// Is the password correct?
		const is_verified = await verify_password(db, password, user.password_hash, user.id);
		// If the password is not correct, return null
		if (!is_verified) {
			console.log('Password verification failed.');
			return null;
		}

		// Create a JWT and refresh_token
		const jwt = await create_jwt(user.id);
		const refresh_token: string = await create_refresh_token(db, user.id);

		return {
			user,
			refresh_token,
			jwt,
		};
	} catch (e) {
		console.error('Error during login:', e);
		if (e instanceof Error) {
			throw new Error(e.message);
		} else {
			throw new Error('An unknown error occurred');
		}
	}
}
