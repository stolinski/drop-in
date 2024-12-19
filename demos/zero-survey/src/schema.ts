import {
	createSchema,
	createTableSchema,
	definePermissions,
	type ExpressionBuilder,
	type TableSchemaToRow
} from '@rocicorp/zero';

const profileSchema = createTableSchema({
	tableName: 'profile',
	columns: {
		id: 'string',
		user_id: 'string',
		name: 'string',
		avatar: 'string'
	},
	primaryKey: ['id'],
	relationships: {}
});

const userSchema = createTableSchema({
	tableName: 'user',
	columns: {
		id: 'string',
		email: 'string',
		verified: 'boolean'
	},
	primaryKey: ['id'],
	relationships: {
		profile: {
			sourceField: 'id',
			destSchema: profileSchema,
			destField: 'user_id'
		}
	}
});

const questionSchema = createTableSchema({
	tableName: 'questions',
	columns: {
		id: 'string',
		survey_id: 'string',
		question_text: 'string',
		question_type: 'string',
		description: { type: 'string', optional: true },
		order: 'number',
		config: 'json'
	},
	primaryKey: ['id'],
	relationships: {
		answers: {
			sourceField: 'id',
			destSchema: () => answerSchema,
			destField: 'question_id'
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
			sourceField: 'id',
			destSchema: () => questionSchema,
			destField: 'survey_id'
		},
		user: {
			sourceField: 'user_id',
			destSchema: () => userSchema,
			destField: 'id'
		},
		responses: {
			sourceField: 'id',
			destSchema: () => responseSchema,
			destField: 'survey_id'
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

type AuthData = {
	sub: string;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	const allowIfLoggedIn = (authData: AuthData, { cmp }: ExpressionBuilder<typeof surveySchema>) => {
		const yo = cmp('user_id', '=', authData.sub);
		return yo;
	};

	const allowSurveyIfLogggedIn = (
		authData: AuthData,
		{ cmp }: ExpressionBuilder<typeof surveySchema>
	) => cmp('user_id', '=', authData.sub);

	return {
		surveys: {
			insert: undefined
		},
		questions: {
			insert: undefined
		}
	};
});

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
