import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { html_pages, md_pages } from '@drop-in/tools';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess(), md_pages(), html_pages()],
	extensions: ['.svelte', '.md', '.html'],
	kit: {
		adapter: adapter(),
		alias: {
			$: 'src',
			$settings: 'src/settings',
			$routes: 'src/routes',
			$state: 'src/state',
			$types: 'src/types',
			$utils: 'src/utilities',
		},
	},
};

export default config;
