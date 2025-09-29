// Cookie options
// These are the options for the cookies that are set by the server
// We should make them configurable with the global config.
// The jwt cookie is usually very short, but since we're primarily targeting offline and local apps
// I'm wondering if we should have it longer, like a week. LMK what you think.

// Used for the refresh token
// Set to 90 days as requested
export const cookie_options = {
	httpOnly: true,
	secure: true,
	path: '/',
	sameSite: 'strict',
	maxAge: 60 * 60 * 24 * 90, // 90 days
} as const;

// The jwt cookie (access token)
// Extended to 90 days for long-lived sessions
export const jwt_cookie_options = {
	path: '/',
	maxAge: 60 * 60 * 24 * 90, // 90 days
	httpOnly: true,
	sameSite: 'strict',
	secure: true,
} as const;
