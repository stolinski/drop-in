declare global {
	var DROP_IN: {
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
