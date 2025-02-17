// Cookie options
// These are the options for the cookies that are set by the server
// We should make them configurable with the global config.
// The jwt cookie is usually very short, but since we're primarily targeting offline and local apps
// I'm wondering if we should have it longer, like a week. LMK what you think.

// Used for the refresh token
// Longer maxAge, currently at 60 days. I dunno, when I think about mobile apps,
// If I go to use them after 60 days, they don't usually make me sign in again.
// But maybe they do, LMK what you think.
export const cookie_options = {
	httpOnly: true,
	secure: true,
	path: '/',
	sameSite: 'strict',
	maxAge: 60 * 60 * 24 * 60,
} as const;

// The jwt cookie
// This is the jwt access token, it's very short lived, like 1 week.
// Could be shorter. See above note.
export const jwt_cookie_options = {
	path: '/',
	maxAge: 60 * 60 * 24 * 7,
	httpOnly: false,
	sameSite: 'strict',
	secure: true,
} as const;
