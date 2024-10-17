// async getSessionByToken(sessionToken: string): Promise<Session | null> {
// 	return db.query.session.findFirst({
// 		where: eq(sessionSchema.sessionToken, sessionToken),
// 	});
// }

// async createSession(
// 	userId: string | number,
// 	sessionToken: string,
// 	expiresAt: Date,
// ): Promise<void> {
// 	await db.insert(sessionSchema).values({
// 		userId: userId as any,
// 		sessionToken,
// 		expiresAt,
// 	});
// }

// async extendSession(sessionToken: string, newExpiresAt: Date): Promise<void> {
// 	await db
// 		.update(sessionSchema)
// 		.set({ expiresAt: newExpiresAt })
// 		.where(eq(sessionSchema.sessionToken, sessionToken));
// }

// async deleteSession(sessionToken: string): Promise<void> {
// 	await db.delete(sessionSchema).where(eq(sessionSchema.sessionToken, sessionToken));
// }
