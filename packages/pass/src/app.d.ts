import type { User } from './schema.js';

declare global {
	const DROP_IN: {
		email: {
			host?: string;
			port?: number;
			secure?: boolean;
			from?: string;
		};
		app: {
			url: string;
			name: string;
			route: string;
		};
	};
	namespace App {
		interface Locals {
			user?: Partial<User>;
		}
	}
}

export {};
