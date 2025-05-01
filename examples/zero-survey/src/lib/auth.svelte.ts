import { get_login } from '@drop-in/pass/client';
import type { User } from '@drop-in/pass/schema';
import type { Profile } from './data/db_schema';

// This is a way to keep track of the user globally
class Auth {
	user: Partial<User & { profile: Partial<Profile> }> = $state({});
	auth: { sub: string | undefined; jwt: string | undefined } | null = $state(null);
	constructor() {
		this.auth = get_login();
	}

	set_user(user: User | {}) {
		console.log('user', user);
		this.user = user;
	}
}
export const auth = new Auth();
