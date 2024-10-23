// Welcome to @drop-in/pass
// The season pass to your app
// That's just cute language for an auth package but hey, we like to have fun around here.

// This is the main entry point for the package.
// Here we will export all the methods for the package.
// Eventually, I'd like to expose every bit of this so that people can use it to build their on systems, but for v1 we're just trying to get it all working turnkey OOTB.
// We are using JWT based auth in a cookie with refresh tokens in a httpOnly cookie
// I'm open to improvements here, but want to keep it JWT for compatibility with Zero.

// Routes
// This might be the most interesting part, because we'll import all of the login routes and use them as a hook in the client's hooks.server.ts
// See pass_routes() for the central station of auth routes.
export * from './routes';

// We also export all of the functions that are consumed by routes if you'd like to make your own routes.

// Functions for creating an account
export * from './sign_up';

// Functions for logging in
export * from './login';
// Functions for logging out
export * from './logout';

// Methods for resetting password
// export * from './reset_password';

// Methods for deleting account
// Methods for updating account
// Methods for getting account
