import { user_details, refresh_tokens_details } from '@drop-in/pass/schema';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', user_details);

export const refresh_tokens = pgTable('refresh_token', refresh_tokens_details);
// Put any user information you want attached to the user here by extending the profile_base.
export const profile = pgTable('profile', {
	id: varchar().primaryKey(),
	user_id: varchar()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: varchar().notNull(),
	avatar: varchar()
	// Additional fields can be added here by consumers
});
