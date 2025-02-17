import { sequence } from '@sveltejs/kit/hooks';
import { pass_routes } from '@drop-in/pass';
import { drop_hook } from '@drop-in/plugin/hook';

export const handle = sequence(pass_routes, drop_hook);
