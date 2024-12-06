import settings from 'virtual:dropin-config';
import { goto } from '$app/navigation';
import { toaster } from '@drop-in/decks';
import { cache } from '$lib/z.svelte';

export class AuthForm {
	status: 'LOADING' | 'SUCCESS' | 'ERROR' | 'INITIAL' = $state('INITIAL');
	error_message: string | undefined = $state();

	loading() {
		this.status = 'LOADING';
	}

	error(e_message: string) {
		toaster.error(e_message);
		this.status = 'ERROR';
		this.error_message = e_message;
	}

	success(route: string | boolean = settings.app.route, message: string = 'Success') {
		// Reset the Zero instance
		cache.reset();

		toaster.success(message);
		this.error_message = undefined;
		this.status = 'SUCCESS';
		// Redirect to wherever post login
		if (route && typeof route === 'string') goto(route);
	}
}

// TODO: Magic Link
