import bcrypt from 'bcryptjs';
const { compare, genSalt, hash } = bcrypt;

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
 * Verifies a password against a hash.
 *
 * @param password - The password to verify
 * @param hash - The hash to verify against
 * @returns True if the password matches the hash, false otherwise
 */
export async function verify_password(password: string, hash: string): Promise<boolean> {
	return compare(password, hash);
}
