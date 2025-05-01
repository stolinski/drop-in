import { drizzleZeroConfig } from 'drizzle-zero';
import { profile, user } from './db_schema';
import { definePermissions, NOBODY_CAN, type ExpressionBuilder, type Row } from '@rocicorp/zero';

// ? 101. Schema file
// Zero uses a schema to know what tables and columns exist
// Since we've already defined a schema for Drizzle, we can use drizzle-zero to create a Zero schema
// Zero Docs https://zero.rocicorp.dev/docs/zero-schema
// Drizzle Zero Docs: https://github.com/BriefHQ/drizzle-zero
// Drizzle Zero basically just takes your Drizzle schema and converts it into a Zero schema, while letting you specify which columns should be exposed to Zero,
// ! Note If a column is exposed to Zero, it will be exposed to the client

export const schema = drizzleZeroConfig(
	{
		user,
		profile
	},
	{
		tables: {
			user: {
				id: true,
				email: true,
				verified: true,
				password_hash: false,
				created_at: true,
				updated_at: true,
				verification_token: false
			},
			profile: {
				id: true,
				user_id: true,
				name: true,
				avatar: true
			}
		}
	}
);

// Client Side Types are available here

export type Schema = typeof schema;
export type User = Row<typeof schema.tables.user>;
export type Profile = Row<typeof schema.tables.profile>;
// Q is the type of the result of the query. Basically gives you a "current" wrapper
export type Q<T> = { current: T };

type AuthData = {
	sub: string | null;
};

// ? 102. Permissions
// Permissions are defined by the user's role and the action they are trying to perform
// Permissions are a feature of Zero and are all disallow by default
// https://zero.rocicorp.dev/docs/permissions

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	const allowIfUserIsSelf = (authData: AuthData, { cmp }: ExpressionBuilder<Schema, 'profile'>) => {
		return cmp('user_id', '=', authData?.sub ?? '');
	};

	return {
		user: {
			row: {
				insert: NOBODY_CAN,
				update: { preMutation: NOBODY_CAN },
				delete: NOBODY_CAN
			}
		},
		profile: {
			row: {
				select: [allowIfUserIsSelf],
				insert: [allowIfUserIsSelf],
				update: { preMutation: [allowIfUserIsSelf] },
				delete: [allowIfUserIsSelf]
			}
		}
	};
});
