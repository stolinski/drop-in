export const load = async function ({ params }) {
	const post = await import(`$/posts/${params.slug}.md`);
	return {
		meta: { ...post.metadata, slug: params.slug },
		content: post.default,
	};
};
