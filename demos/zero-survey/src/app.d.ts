/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	namespace App {
		// interface Locals {}
		// interface Platform {}
		// interface Session {}
		// interface Stuff {}
	}
}

declare module 'virtual:dropin-config' {
	const config: {
		app: {
			url: string;
			name: string;
			route: string;
		};
	};
	export default config;
}
declare module 'virtual:dropin-server-config' {
	const config: {
		auth: {
			jwt_secret?: string;
		};
		email?: {
			host: string;
			port: number;
			secure?: boolean;
			from?: string;
			auth?: {
				user: string;
				pass: string;
			};
		};
		db: {
			url: string;
		};
		app: {
			public: {
				url: string;
				name: string;
				route: string;
			};
		};
	};
	export default config;
}
