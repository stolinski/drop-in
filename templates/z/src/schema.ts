import { drizzleZeroConfig } from 'drizzle-zero';
import { profile, user } from './db_schema';
import { definePermissions, NOBODY_CAN, type ExpressionBuilder, type Row } from '@rocicorp/zero';

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

export type Schema = typeof schema;
export type User = Row<typeof schema.tables.user>;
export type Profile = Row<typeof schema.tables.profile>;
export type Q<T> = { current: T };

type AuthData = {
	sub: string | null;
};

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
