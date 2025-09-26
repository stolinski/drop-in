import bcrypt from 'bcryptjs';
import { sha256 } from './utils.js';
import { user } from './schema.js';
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
	db: any,
	enteredPassword: string,
	storedHash: string,
	userId: string,
): Promise<boolean> {
	try {
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
			console.log(
				'Password verified using the OLD hashing method. Attempting to rehash with the NEW method.',
			);

			try {
				// Rehash the password using the new method
				const newHashedPassword = await hash_n_salt_password(enteredPassword);

				// Update the user's password hash in the database
				const updateSuccess = await update_user_password(db, userId, newHashedPassword);

				if (updateSuccess) {
					console.log('Password successfully rehashed and updated to the NEW method.');
				} else {
					console.warn(
						'Password verification succeeded but conversion to new method failed. User can still log in.',
					);
				}
			} catch (error) {
				console.error('Error during password rehashing process:', error);
				console.warn(
					'Password verification succeeded but conversion failed. User can still log in.',
				);
			}

			// Return true regardless of conversion success - the old password was valid
			return true;
		}

		// If both methods fail, authentication fails
		console.log('Password verification failed using both methods.');
		return false;
	} catch (error) {
		console.error('Unexpected error during password verification:', error);
		if (error instanceof Error) {
			console.error('Error details:', error.message);
			console.error('Stack trace:', error.stack);
		}
		return false;
	}
}

/**
 * Updates the user's password hash in the database.
 *
 * @param userId - The ID of the user.
 * @param newHashedPassword - The new bcrypt hash of the password.
 * @returns Promise<boolean> - Returns true if update succeeded, false otherwise.
 */
async function update_user_password(db: any, userId: string, newHashedPassword: string): Promise<boolean> {
	try {
		const result = await db
			.update(user)
			.set({ password_hash: newHashedPassword })
			.where(eq(user.id, userId))
			.execute();

		console.log('Password successfully updated for user:', userId);
		return true;
	} catch (error) {
		console.error('Failed to update password hash for user:', userId, error);
		// Log the specific error details for debugging
		if (error instanceof Error) {
			console.error('Error details:', error.message);
		}
		return false;
	}
}
