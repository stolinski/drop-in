import type { QuestionConfig } from '$lib/types';
import { user, refresh_tokens } from '@drop-in/pass/schema';
import { relations } from 'drizzle-orm';
import { pgTable, varchar, timestamp, integer, text, jsonb } from 'drizzle-orm/pg-core';

// Put any user information you want attached to the user here by extending the profile_base.
const profile = pgTable('profile', {
	id: varchar().primaryKey(),
	user_id: varchar()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: varchar().notNull(),
	avatar: varchar()
	// Additional fields can be added here by consumers
});

export type Profile = typeof profile.$inferSelect;

export const surveys = pgTable('surveys', {
	id: varchar().primaryKey(),
	title: varchar().notNull(),
	description: text(),
	created_at: timestamp().defaultNow().notNull(),
	user_id: varchar()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const DEFAULT_CONFIG = {
	required: false
} as const;

export const questions = pgTable('questions', {
	id: varchar().primaryKey(),
	survey_id: varchar()
		.references(() => surveys.id)
		.notNull(),
	question_text: text().notNull(),
	description: text(),
	question_type: varchar().default('text').notNull(),
	order: integer().notNull(),
	config: jsonb().$type<QuestionConfig>().notNull().default(DEFAULT_CONFIG)
});

export const responses = pgTable('responses', {
	id: varchar().primaryKey(),
	survey_id: varchar()
		.references(() => surveys.id)
		.notNull(),
	started_at: timestamp().defaultNow().notNull(),
	completed_at: timestamp()
});

export const answers = pgTable('answers', {
	id: varchar().primaryKey(),
	response_id: varchar()
		.references(() => responses.id)
		.notNull(),
	question_id: varchar()
		.references(() => questions.id)
		.notNull(),
	answer_text: text().notNull()
});

export const surveyRelations = relations(surveys, ({ many }) => ({
	questions: many(questions),
	responses: many(responses)
}));

export { user, refresh_tokens, profile };
