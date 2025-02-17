import type { Handle } from '@sveltejs/kit';

export const drop_hook: Handle = async ({ event, resolve }) => {
	return await resolve(event, {
		transformPageChunk: async ({ html }) => {
			const head = `<script>globalThis.DROP_IN=${JSON.stringify(globalThis.DROP_IN)}</script>`;
			return html.replace('</head>', head + '</head>');
		},
	});
};
