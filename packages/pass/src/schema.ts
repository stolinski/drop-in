import { InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar, timestamp, unique, foreignKey, boolean } from 'drizzle-orm/pg-core';

// Define the 'user' table with a fixed schema
export const user = pgTable('user', {
	id: varchar('id').primaryKey(), // 21 is a common length for nanoid
	email: varchar('email', { length: 255 }).notNull().unique(),
	password_hash: varchar('password_hash', { length: 255 }).notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
	verified: boolean('verified').notNull().default(false),
});

export type User = InferSelectModel<typeof user>;

export const refresh_tokens = pgTable('refresh_token', {
	id: varchar('id').primaryKey(),
	user_id: varchar('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: varchar('token', { length: 255 }).notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	expires_at: timestamp('expires_at').notNull(),
});

// Define the 'profile' table, which can be extended by consumers
export const profile = pgTable('profile', {
	id: varchar('id').primaryKey(),
	user_id: varchar('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	// Additional fields can be added here by consumers
});
