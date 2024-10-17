import { nanoid } from 'nanoid';
import { db } from './db';
import { get_user_by_email } from './find_user';
import { create_jwt } from './jwt';
import { bcrypt_password, get_password_string } from './password';
import { user, User } from './schema';
import { check_is_password_valid, is_valid_email, normalize_email } from './utils';
import { create_refresh_token } from './token';

export async function sign_up(
	email: string,
	password: string,
): Promise<{
	user: Partial<User>;
	refresh_token: string;
	jwt: string;
} | null> {
	const normalizedEmail = normalize_email(email);

	if (!is_valid_email(normalizedEmail)) {
		throw new Error('Invalid email');
	}

	if (!check_is_password_valid(password)) {
		throw new Error('Invalid password');
	}

	try {
		// Check if user exists
		const userExists = await get_user_by_email(normalizedEmail);

		if (userExists) {
			throw new Error('User already exists');
		}

		// Hash password
		const passwordHash: string = get_password_string(password);

		// Salts the hashed password before saving to the db
		// Salt Password
		const passwordBcrypt: string = await bcrypt_password(passwordHash);

		// Create new user
		const new_user = await create_user(normalizedEmail, passwordBcrypt);

		if (new_user?.id && new_user?.email) {
			const jwt = await create_jwt(new_user.id, new_user.email);

			const refresh_token: string = await create_refresh_token(new_user.id);

			return {
				user: new_user,
				refresh_token,
				jwt,
			};
		}
		return null;
	} catch (e) {
		console.error('Error during sign up:', e);
		throw new Error(e.message);
	}
}

export async function create_user(email: string, hashedPassword: string): Promise<Partial<User>> {
	const [new_user] = await db
		.insert(user)
		.values({
			id: nanoid(),
			email,
			password_hash: hashedPassword,
			verified: false, // Assuming new users start as unverified
		})
		.returning({
			id: user.id,
			email: user.email,
			created_at: user.created_at,
			updated_at: user.updated_at,
			verified: user.verified,
		});

	if (!new_user) {
		throw new Error('Failed to create user');
	}

	return new_user;
}
