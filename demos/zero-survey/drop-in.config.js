export default {
	email: {
		from: 'fake@changeme.com'
	},
	db: {
		url: process.env.DATABASE_URL
	},
	app: {
		public: {
			url: 'http://localhost:5173',
			name: 'Drop In',
			route: '/dashboard'
		}
	}
};
