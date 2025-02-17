import { z } from './z.svelte';

export const current_user = z.current.query.user.where('id', '=', z.current.userID).one();
