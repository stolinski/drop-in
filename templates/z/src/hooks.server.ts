import { sequence } from '@sveltejs/kit/hooks';
import { pass_routes } from '@drop-in/pass';
import { drop_hook } from '@drop-in/plugin/hook';

// ? What's up with the two hooks?
// Pass Routes is the hook for auth authentication, it includes the routes where auth is handeled.
// Drop hook adds a global so our drop-in.config.js is read and applied to globals

export const handle = sequence(pass_routes, drop_hook);
