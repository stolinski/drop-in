export default {
	auth: {
		jwt_secret: process.env.JWT_SECRET,
	},
	email: {
		from: 'fake@changeme.com',
	},
	db: {
		url: process.env.DATABASE_URL,
	},
	app: {
		public: {
			url: process.env.APP_URL,
			name: 'Drop In',
			route: '/dashboard',
		},
	},
};
