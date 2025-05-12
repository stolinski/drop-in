// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Drop In',
			logo: {
				dark: './src/assets/drop-in.svg',
				light: './src/assets/drop-in-light.svg',
				replacesTitle: true,
			},
			customCss: ['./src/styles/custom.css'],
			editLink: {
				baseUrl: 'https://github.com/stolinski/drop-in/edit/docs/',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/stolinski/drop-in' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Get Started', slug: 'guides/get-started' },
					],
				},
				{
					label: '@drop-in/pass',
					autogenerate: { directory: 'pass' },
				},
				{
					label: '@drop-in/beeper',
					autogenerate: { directory: 'beeper' },
				},
				{
					label: '@drop-in/ramps',
					autogenerate: { directory: 'ramps' },
				},
				{
					label: '@drop-in/plugin',
					autogenerate: { directory: 'plugin' },
				},
			],
		}),
	],
});
