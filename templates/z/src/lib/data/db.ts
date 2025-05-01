import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../db_schema';

// The db connection
// We use drizzle to connect to the database
// We use the global drop_in_config to get the db url
// This is the same db url that is in the .env file

// The question here is really how much this should be possibly created in teh app itself so that there aren't multiple connections
// But tbh not sure how much of a problem that is. LMK what you think. The goal is to make the user do a little bit of work as possible
// To get up and running.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');

export const db = drizzle({
	connection: process.env.DATABASE_URL,
	schema
});
