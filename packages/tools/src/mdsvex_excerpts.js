import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

/**
 * Just takes the excerpt string and makes it an html string
 * @param {string} markdown
 * @returns string
 */
const markdown_to_html = async (markdown) => {
	const file = await unified().use(remarkParse).use(remarkHtml).process(markdown);

	return String(file);
};

/**
 * Extracts excerpt html from markdown string
 * @param {string} markdown
 * @returns {string}
 */
const extract = (markdown) => {
	const frontmatterEnd = markdown.indexOf('---', 3) + 3; // Finding the end of the frontmatter section
	const withoutFrontmatter = markdown.slice(frontmatterEnd).trim();
	const excerptIndex = withoutFrontmatter.indexOf('<!-- excerpt -->');

	if (excerptIndex !== -1) {
		return withoutFrontmatter.slice(0, excerptIndex).trim();
	}

	return withoutFrontmatter.trim();
};

export function dropInExcerpt() {
	return async function transform(tree, file) {
		const pre_excerpt = extract(file.contents);
		const html = await markdown_to_html(pre_excerpt);
		if (file.data.fm) {
			// Modify the frontmatter data directly
			file.data.fm.excerpt = html;
		} else {
			// If frontmatter data doesn't exist, create a new object
			file.data.fm = {
				excerpt: html,
			};
		}

		return tree;
	};
}
