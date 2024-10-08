import { settings } from '$settings';
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

	success(route: string | boolean = settings.app_route, message: string = 'Success') {
		toaster.success(message);
		this.error_message = undefined;
		this.status = 'SUCCESS';
		if (route && typeof route === 'string') goto(route);
	}
}

// TODO: Email
// TODO: Auth
// TODO: Magic Link
