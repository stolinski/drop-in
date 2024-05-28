/**
 *
 * @param {string} slug
 * @returns string
 */
export function desluggify(slug) {
	return slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
