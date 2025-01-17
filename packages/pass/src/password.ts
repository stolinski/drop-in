import bcrypt from 'bcryptjs';
import { sha256 } from './utils';
import { db } from './db';
import { user } from './schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
const { compare, genSalt, hash } = bcrypt;

// bcrypt.setRandomFallback((size) => {
// 	return crypto.randomBytes(size);
// });

/**
 * Hashes a password using bcrypt.
 *
 * @param password - The password to hash
 * @returns The hashed password
 */
export const hash_n_salt_password = async (password: string): Promise<string> => {
	const salt = await genSalt(10);
	return hash(password, salt);
};

/**
 * Verifies a user's password against the stored hash.
 * Attempts the new method first, then the old method if necessary.
 * If the old method succeeds, rehashes the password using the new method and updates the DB.
 *
 * @param enteredPassword - The plaintext password entered by the user.
 * @param storedHash - The bcrypt hash stored in the database.
 * @param userId - The ID of the user (needed for updating the password hash).
 * @returns A boolean indicating whether the password is valid.
 */
export async function verify_password(
	enteredPassword: string,
	storedHash: string,
	userId: string,
): Promise<boolean> {
	// Attempt the new method: bcrypt(password)
	const isMatchNew = await compare(enteredPassword, storedHash);
	if (isMatchNew) {
		console.log('Password verified using the NEW hashing method.');
		return true;
	}

	// If the new method fails, attempt the old method: bcrypt(sha256(password))
	const sha256Hash = sha256(enteredPassword);
	const isMatchOld = await compare(sha256Hash, storedHash);
	if (isMatchOld) {
		console.log('Password verified using the OLD hashing method. Rehashing with the NEW method.');

		// Rehash the password using the new method
		const newHashedPassword = await hash_n_salt_password(enteredPassword);

		// Update the user's password hash in the database
		await update_user_password(userId, newHashedPassword);
		console.log('Password rehashed and updated to the NEW method.');

		return true;
	}

	// If both methods fail, authentication fails
	console.log('Password verification failed using both methods.');
	return false;
}

/**
 * Updates the user's password hash in the database.
 *
 * @param userId - The ID of the user.
 * @param newHashedPassword - The new bcrypt hash of the password.
 */
async function update_user_password(userId: string, newHashedPassword: string): Promise<void> {
	await db
		.update(user)
		.set({ password_hash: newHashedPassword })
		.where(eq(user.id, userId))
		.execute();
}
