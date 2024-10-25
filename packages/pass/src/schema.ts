import { InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

// Define the 'user' table with a fixed schema
export const user = pgTable('user', {
	id: varchar().primaryKey(), // 21 is a common length for nanoid
	email: varchar('email', { length: 255 }).notNull().unique(),
	password_hash: varchar('password_hash', { length: 255 }).notNull(),
	created_at: timestamp().defaultNow().notNull(),
	updated_at: timestamp().defaultNow().notNull(),
	verified: boolean().notNull().default(false),
	verification_token: varchar('verification_token', { length: 255 }),
});

export type User = InferSelectModel<typeof user>;

export const refresh_tokens = pgTable('refresh_token', {
	id: varchar().primaryKey(),
	user_id: varchar()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: varchar('token', { length: 255 }).notNull(),
	created_at: timestamp().defaultNow().notNull(),
	expires_at: timestamp().notNull(),
});
