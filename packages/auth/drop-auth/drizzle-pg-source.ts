// Example implementation for Drizzle with PostgreSQL
import { eq } from 'drizzle-orm';
import { user as userSchema, session as sessionSchema, type Session, type User } from '$src/schema';
import { db } from '$src/hooks.server';
import type { AuthDataSource } from './types';

export class DrizzlePostgresDataSource implements AuthDataSource {
	async createUser(email: string, hashedPassword: string): Promise<User> {
		const [newUser] = await db
			.insert(userSchema)
			.values({
				email,
				hashedPassword,
				verified: false, // Assuming new users start as unverified
			})
			.returning({
				id: userSchema.id,
				email: userSchema.email,
				createdAt: userSchema.createdAt,
				updatedAt: userSchema.updatedAt,
				verified: userSchema.verified,
			});

		if (!newUser) {
			throw new Error('Failed to create user');
		}

		return newUser;
	}

	async getUserByEmail(email: string, full = false): Promise<User | null> {
		const query = {
			where: eq(userSchema.email, email),
		};
		if (!full) {
			query.columns = {
				id: true,
				email: true,
				createdAt: true,
				updatedAt: true,
				verified: true,
			};
		}
		return db.query.user.findFirst(query);
	}

	async getUserById(id: string | number): Promise<User | null> {
		return db.query.user.findFirst({
			where: eq(userSchema.id, id as any),
			columns: {
				id: true,
				email: true,
				createdAt: true,
				updatedAt: true,
				verified: true,
			},
		});
	}

	async getSessionByToken(sessionToken: string): Promise<Session | null> {
		return db.query.session.findFirst({
			where: eq(sessionSchema.sessionToken, sessionToken),
		});
	}

	async createSession(
		userId: string | number,
		sessionToken: string,
		expiresAt: Date,
	): Promise<void> {
		await db.insert(sessionSchema).values({
			userId: userId as any,
			sessionToken,
			expiresAt,
		});
	}

	async extendSession(sessionToken: string, newExpiresAt: Date): Promise<void> {
		await db
			.update(sessionSchema)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessionSchema.sessionToken, sessionToken));
	}

	async deleteSession(sessionToken: string): Promise<void> {
		await db.delete(sessionSchema).where(eq(sessionSchema.sessionToken, sessionToken));
	}
}
