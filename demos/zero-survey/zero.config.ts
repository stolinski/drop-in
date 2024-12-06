import { defineConfig } from '@rocicorp/zero/config';
import { schema } from './src/lib/data/schema';

export default defineConfig(schema, () => {
	return {
		upstreamDBConnStr: 'postgresql://postgres@127.0.0.1/drop',
		cvrDBConnStr: 'postgresql://postgres@127.0.0.1/drop',
		changeDBConnStr: 'postgresql://postgres@127.0.0.1/drop',
		replicaDBFile: must(process.env.REPLICA_DB_FILE),
		jwtSecret: must(process.env.JWT_SECRET),

		numSyncWorkers: undefined, // this means numCores - 1

		log: {
			level: 'debug',
			format: 'text',
		},
	};
});

function must(val) {
	if (!val) {
		throw new Error('Expected value to be defined');
	}
	return val;
}

// On intial load, if the user exists, load the user into auth state.
// If
