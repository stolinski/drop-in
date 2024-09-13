import type { Post } from '$/types/types';
import { json } from '@sveltejs/kit';
async function getPosts() {
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

export async function GET() {
	const posts = await getPosts();
	return json(posts);
}
