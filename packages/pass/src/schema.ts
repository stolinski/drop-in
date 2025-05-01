import { InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user_details = {
	id: varchar().primaryKey(), // 21 is a common length for nanoid
	email: varchar('email', { length: 255 }).notNull().unique(),
	password_hash: varchar('password_hash', { length: 255 }).notNull(),
	created_at: timestamp().defaultNow().notNull(),
	updated_at: timestamp().defaultNow().notNull(),
	verified: boolean().notNull().default(false),
	verification_token: varchar('verification_token', { length: 255 }),
};

// Define the 'user' table with a fixed schema
export const user = pgTable('user', user_details);

export type User = InferSelectModel<typeof user>;

export const refresh_tokens_details = {
	id: varchar().primaryKey(),
	user_id: varchar()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: varchar('token', { length: 255 }).notNull(),
	created_at: timestamp().defaultNow().notNull(),
	expires_at: timestamp().notNull(),
};

export const refresh_tokens = pgTable('refresh_token', refresh_tokens_details);

export type RefreshToken = InferSelectModel<typeof refresh_tokens>;
