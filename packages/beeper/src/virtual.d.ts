// In the consuming package, create a file: src/types/virtual-modules.d.ts
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
