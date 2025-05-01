import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/data/db_schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
