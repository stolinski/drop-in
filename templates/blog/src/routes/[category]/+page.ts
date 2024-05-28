import { desluggify } from '@drop-in/tools';
import { get_all_categories } from '$/lib/data/categories';
import {
	get_all_posts,
	get_all_posts_in_category,
	get_all_tags_from_posts,
} from '$/lib/data/posts';

export const load = async function ({ params }) {
	const category = await import(`$/categories/${params.category}.md`);
	const posts = get_all_posts();
	return {
		category: desluggify(params.category),
		content: category.default,
		posts: get_all_posts_in_category(params.category),
		categories: get_all_categories(),
		tags: get_all_tags_from_posts(posts),
	};
};
