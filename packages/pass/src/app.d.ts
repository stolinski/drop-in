import type { User } from './schema.js';

type EmailCallback = (options: {
	to: string;
	subject: string;
	html: string;
	from?: string;
}) => Promise<void> | void;

declare global {
	const DROP_IN: {
		email?: {
			// Legacy config (deprecated but still supported)
			host?: string;
			port?: number;
			secure?: boolean;
			from?: string;
			// New callback-based config
			sendEmail?: EmailCallback;
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
