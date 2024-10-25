import { PUBLIC_SERVER } from '$env/static/public';
import { Zero } from '@rocicorp/zero';

const userSchema = {
	tableName: 'user',
	columns: {
		id: { type: 'string' },
		email: { type: 'string' },
		verified: { type: 'boolean' },
	},
	primaryKey: ['id'],
	relationships: {
		profile: {
			source: 'id',
			dest: {
				schema: () => profileSchema,
				field: 'user_id',
			},
		},
	},
} as const;

const profileSchema = {
	tableName: 'profile',
	columns: {
		id: { type: 'string' },
		user_id: { type: 'string' },
		name: { type: 'string' },
	},
	primaryKey: ['id'],
	relationships: {
		user: {
			source: 'user_id',
			dest: {
				schema: () => userSchema,
				field: 'id',
			},
		},
	},
} as const;

// const mediumSchema = {
// 	tableName: 'medium',
// 	columns: {
// 		id: { type: 'string' },
// 		name: { type: 'string' },
// 	},
// 	primaryKey: ['id'],
// 	relationships: {},
// } as const;

// const messageSchema = {
// 	tableName: 'message',
// 	columns: {
// 		id: { type: 'string' },
// 		senderID: { type: 'string' },
// 		replyToID: { type: 'string', optional: true },
// 		mediumID: { type: 'string' },
// 		body: { type: 'string' },
// 		timestamp: { type: 'number' },
// 	},
// 	primaryKey: ['id'],
// 	relationships: {
// 		sender: {
// 			source: 'senderID',
// 			dest: {
// 				schema: () => userSchema,
// 				field: 'id',
// 			},
// 		},
// 		medium: {
// 			source: 'mediumID',
// 			dest: {
// 				schema: () => mediumSchema,
// 				field: 'id',
// 			},
// 		},
// 		replies: {
// 			source: 'id',
// 			dest: {
// 				schema: () => messageSchema,
// 				field: 'replyToID',
// 			},
// 		},
// 	},
// } as const;

export const schema = {
	version: 1,
	tables: {
		user: userSchema,
		profile: profileSchema,
	},
} as const;
