import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { html_pages, md_pages } from '@drop-in/tools';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess(), md_pages()],
	extensions: ['.svelte', '.svx', '.md', '.html'],
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
