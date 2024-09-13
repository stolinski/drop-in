export const load = async function () {
	const modules = import.meta.glob('$routes/**', { eager: true });

	const folderNames = Object.keys(modules)
		.map((path) => {
			const segments = path.split('/');
			return segments.slice(3, -1).join('/');
		})
		.filter((path) => path !== '')
		.map((path) => path.replace(/\(.*?\)\//g, ''))
		.filter((path) => !path.includes('['));

	const uniqueFolderNames = [...new Set(folderNames)];

	const transformedArray = uniqueFolderNames
		.map((folderName) => {
			const segments = folderName.split('/');
			const name = segments
				.map((segment) =>
					segment
						.replace(/[-_]/g, ' ')
						.replace(/\[.*?\]/g, '')
						.split(' ')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' '),
				)
				.join(' ');
			const link = '/' + segments.join('/');
			return { name, link };
		})
		.filter((item) => item.link !== '/');

	return { routes: transformedArray };
};
