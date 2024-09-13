export type Post = {
	title: string;
	slug: string;
	date: string;
	tags: string[];
	status: 'LIVE' | 'DRAFT';
	excerpt: string;
	category: string;
};

export type Category = {
	name: string;
	description?: string;
	slug: string;
	metadata: {
		icon: string;
	};
};
