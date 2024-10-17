import bcrypt from 'bcryptjs';
import crypto, { randomBytes } from 'crypto';
const { compare, genSalt, hash } = bcrypt;
// Given a 'password' from the client, extract the string that we should
// bcrypt. 'password' can be one of:
//  - String (the plaintext password)
//  - Object with 'digest' and 'algorithm' keys. 'algorithm' must be "sha-256".
export const get_password_string = (password: string): string => {
	const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
	return passwordHash;
};

export const bcrypt_password = async (password: string): Promise<string> => {
	const salt = await genSalt(10);
	const hashedPassword = await hash(password, salt);
	return hashedPassword;
};

// Compares password to hash to confirm they are the same
export async function verify_password(password: string, hash: string): Promise<boolean> {
	const compared: boolean = await compare(password, hash);
	return compared;
}
