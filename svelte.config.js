import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$: 'src',
			$routes: 'src/routes',
			$state: 'src/lib/state',
			$types: 'src/types',
			$utils: 'src/utilities',
		}
	}
}

export default config
