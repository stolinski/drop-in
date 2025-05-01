// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

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
}

export {};
