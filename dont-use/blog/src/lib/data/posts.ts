import type { Post } from '$types/types';
import { desluggify } from '@drop-in/tools';

export function get_all_posts() {
	let posts: Post[] = [];

	const paths = import.meta.glob('/src/posts/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata;
			const post = { ...metadata, slug };
			if (post.status === 'LIVE') posts.push(post);
		}
	}

	posts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return posts;
}

export function get_all_tags_from_posts(posts: Post[]) {
	const category_counts = new Map();

	posts.forEach((post) => {
		post.tags.forEach((tag) => {
			if (category_counts.has(tag)) {
				category_counts.set(tag, category_counts.get(tag) + 1);
			} else {
				category_counts.set(tag, 1);
			}
		});
	});
	return category_counts;
}

export function get_all_posts_in_category(category: string) {
	const posts = get_all_posts();
	return posts.filter((post) => post.category === category);
}
