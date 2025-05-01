import { goto } from '$app/navigation';
import { toaster } from '@drop-in/decks';

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

	success(route: string | boolean = DROP_IN.app.route, message: string = 'Success') {
		// Reset the Zero instance
		toaster.success(message);
		this.error_message = undefined;
		this.status = 'SUCCESS';
		// Redirect to wherever post login
		if (route && typeof route === 'string') goto(route, { invalidateAll: true });
	}
}

// TODO: Magic Link
