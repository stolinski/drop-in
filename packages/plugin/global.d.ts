export interface DropInConfig {
	auth: {
		jwt_secret?: string;
	};
	email?: {
		host: string;
		port: number;
		secure?: boolean;
		from?: string;
		auth?: {
			user?: string;
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
}

declare global {
	module globalThis {
		var drop_in_config: DropInConfig;
	}
	module global {
		var drop_in_config: DropInConfig;
	}
}

export {};
