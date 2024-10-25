import { user, refresh_tokens } from '@drop-in/pass/schema';
import { pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

// Put any user information you want attached to the user here by extending the profile_base.
const profile = pgTable('profile', {
	id: varchar().primaryKey(),
	user_id: varchar()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: varchar().notNull(),
	// Additional fields can be added here by consumers
});

export { user, refresh_tokens, profile };
