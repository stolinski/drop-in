import { pb } from '$/pocketbase';
import type { UsersResponse } from '$/types/pocketbase';

export const ssr = false;

export const load = async function ({ depends }) {
	depends('app:user');
	return {
		user: pb.authStore.isValid ? (pb.authStore.model as UsersResponse) : undefined,
	};
};
