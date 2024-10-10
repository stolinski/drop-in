export const normalizeEmail = (email: string): string => {
	return decodeURIComponent(email).toLowerCase().trim();
};
