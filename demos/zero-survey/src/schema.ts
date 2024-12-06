import { createSchema, createTableSchema, type TableSchemaToRow } from '@rocicorp/zero';

const userSchema = createTableSchema({
	tableName: 'user',
	columns: {
		id: { type: 'string' },
		email: { type: 'string' },
		verified: { type: 'boolean' }
	},
	primaryKey: ['id'],
	relationships: {
		profile: {
			source: 'id',
			dest: {
				schema: () => profileSchema,
				field: 'user_id'
			}
		}
	}
});

const profileSchema = createTableSchema({
	tableName: 'profile',
	columns: {
		id: { type: 'string' },
		user_id: { type: 'string' },
		name: { type: 'string' },
		avatar: { type: 'string', optional: true }
	},
	primaryKey: ['id'],
	relationships: {}
});

const questionSchema = createTableSchema({
	tableName: 'questions',
	columns: {
		id: { type: 'string' },
		survey_id: { type: 'string' },
		question_text: { type: 'string' },
		question_type: { type: 'string' },
		description: { type: 'string', optional: true },
		order_num: { type: 'number' }
	},
	primaryKey: ['id'],
	relationships: {
		answers: {
			source: 'id',
			dest: {
				schema: () => answerSchema,
				field: 'question_id'
			}
		}
	}
});

const responseSchema = createTableSchema({
	tableName: 'responses',
	columns: {
		id: { type: 'string' },
		survey_id: { type: 'string' },
		started_at: { type: 'number' },
		completed_at: { type: 'number', optional: true }
	},
	primaryKey: ['id'],
	relationships: {}
});

const answerSchema = createTableSchema({
	tableName: 'answers',
	columns: {
		id: { type: 'string' },
		response_id: { type: 'string' },
		question_id: { type: 'string' },
		answer_text: { type: 'string' }
	},
	primaryKey: ['id'],
	relationships: {}
});

const surveySchema = createTableSchema({
	tableName: 'surveys',
	columns: {
		id: { type: 'string' },
		title: { type: 'string' },
		description: { type: 'string', optional: true },
		created_at: { type: 'number' },
		user_id: { type: 'string' }
	},
	primaryKey: ['id'],
	relationships: {
		questions: {
			source: 'id',
			dest: {
				schema: () => questionSchema,
				field: 'survey_id'
			}
		},
		user: {
			source: 'user_id',
			dest: {
				schema: () => userSchema,
				field: 'id'
			}
		},
		responses: {
			source: 'id',
			dest: {
				schema: () => responseSchema,
				field: 'survey_id'
			}
		}
	}
});

export const schema = createSchema({
	version: 1,
	tables: {
		user: userSchema,
		profile: profileSchema,
		surveys: surveySchema,
		questions: questionSchema,
		responses: responseSchema,
		answers: answerSchema
	}
});

export type Schema = typeof schema;
export type User = TableSchemaToRow<typeof userSchema>;
export type Profile = TableSchemaToRow<typeof profileSchema>;
export type Survey = TableSchemaToRow<typeof surveySchema>;
export type Question = TableSchemaToRow<typeof questionSchema>;
export type Response = TableSchemaToRow<typeof responseSchema>;
export type Answer = TableSchemaToRow<typeof answerSchema>;

// type AuthData = {
// 	sub: string;
// };

// export const authorization = defineAuthorization<AuthData, Schema>(schema, (query) => {
// 	const allowIfLoggedIn = (authData: AuthData) => query.user.where('id', '=', authData.sub);

// 	const allowIfMessageSender = (authData: AuthData, row: Message) => {
// 		return query.message.where('id', row.id).where('senderID', '=', authData.sub);
// 	};
// 	return {
// 		message: {
// 			row: {
// 				// anyone can insert
// 				insert: undefined,
// 				// only sender can edit their own messages
// 				update: [allowIfMessageSender],
// 				// must be logged in to delete
// 				delete: [allowIfLoggedIn]
// 			}
// 		}
// 	};
// });
