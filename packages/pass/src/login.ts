import { get_user_by_email } from './find_user';
import { verify_password } from './password';
import { create_jwt } from './jwt';
import crypto from 'crypto';
import { User } from './schema';
import { create_refresh_token } from './token';

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
		const user = await get_user_by_email(email, true);

		if (!user) {
			return null;
		}

		const password_hash = crypto.createHash('sha256').update(password).digest('hex');
		// Is the password correct?
		const is_verified = await verify_password(password_hash, user.password_hash);
		// If the password is not correct, return null
		if (!is_verified) {
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
