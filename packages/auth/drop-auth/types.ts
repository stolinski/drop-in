import type { Session, User } from '$src/schema';

// Updated AuthDataSource interface
export interface AuthDataSource {
	getUserByEmail(email: string): Promise<User | null>;
	getUserById(id: string | number): Promise<User | null>;
	getSessionByToken(sessionToken: string): Promise<Session | null>;
	createSession(userId: string | number, sessionToken: string, expiresAt: Date): Promise<void>;
	extendSession(sessionToken: string, newExpiresAt: Date): Promise<void>;
	deleteSession(sessionToken: string): Promise<void>;
	createUser(email: string, hashedPassword: string): Promise<User>;
}
