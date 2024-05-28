/** @returns {import('svelte/types/compiler/preprocess').PreprocessorGroup} */
export function html_pages() {
	return {
		name: 'html_pages',
		async markup({ content, filename }) {
			if (filename?.endsWith('.html')) {
				return {
					code: `<script>const md = ${JSON.stringify(content)};</script>{@html md}`,
				};
			}
		},
	};
}
