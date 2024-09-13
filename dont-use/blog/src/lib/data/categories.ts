import { desluggify } from '@drop-in/tools';
import type { Category } from '$types/types';

export function get_all_categories() {
	let categories: Category[] = [];

	const paths = import.meta.glob('/src/categories/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata;
			const category = { name: desluggify(slug), slug, metadata };
			categories.push(category);
		}
	}
	return categories;
}
