import dropin from '@drop-in/plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv, type ConfigEnv } from 'vite';

export default ({ mode }: ConfigEnv) => {
	Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

	return defineConfig({
		server: {
			port: 1234
		},

		plugins: [dropin(), sveltekit()],
	});
};
