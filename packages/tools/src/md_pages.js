import { dropInExcerpt } from './mdsvex_excerpts.js';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { getHighlighter } from 'shiki';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkToc from 'remark-toc';

/**
 * @typedef Options
 * @type {object}
 * @property {string} syntax_theme - The Shiki theme.
 */

let langs = ['javascript', 'typescript', 'css', 'html', 'svelte', 'jsx'];

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md', '.svx'],
	remarkPlugins: [dropInExcerpt, [remarkToc, { tight: true }]],
	rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await getHighlighter({
				themes: ['night-owl'],
				langs,
			});
			await highlighter.loadLanguage('javascript', 'typescript', 'css', 'html', 'svelte', 'jsx');
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'night-owl' }));
			return `{@html \`${html}\` }`;
		},
	},
};

/**
 *
 * @param {Options} [options]
 * @returns
 */
export function md_pages(options) {
	return mdsvex(mdsvexOptions);
}

// TODO make options actually do something
