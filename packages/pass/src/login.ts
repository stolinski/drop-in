import { get_full_user_by_email } from './find_user';
import { verify_password } from './password';
import { create_jwt } from './jwt';
import { User } from './schema';
import { create_refresh_token } from './token';
/**
 * Logs in a user with the given email and password.
 *
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The user object, JWT, and refresh token if successful, null otherwise
 */
export async function login(
	email: string,
	password: string,
): Promise<{
	user: Partial<User>;
	jwt: string;
	refresh_token: string;
} | null> {
	try {
		// Check if a user exists with that email
		const user = await get_full_user_by_email(email);

		if (!user) {
			console.log('User not found');
			return null;
		}

		// Is the password correct?
		const is_verified = await verify_password(password, user.password_hash, user.id);
		// If the password is not correct, return null
		if (!is_verified) {
			console.log('Password verification failed.');
			return null;
		}

		// Create a JWT and refresh_token
		const jwt = await create_jwt(user.id);
		const refresh_token: string = await create_refresh_token(user.id);

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
