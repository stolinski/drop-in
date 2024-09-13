import { settings } from '$settings';
import { goto } from '$app/navigation';
import { toast } from '@drop-in/toast';

export function auth_form_state() {
	let status: 'LOADING' | 'SUCCESS' | 'ERROR' | 'INITIAL' = $state('INITIAL');
	let error_message: string | undefined = $state();

	function loading() {
		status = 'LOADING';
	}
	function error(e_message: string) {
		// toast.error(e_message);
		status = 'ERROR';
		error_message = e_message;
	}

	function success(route: string | boolean = settings.app_route) {
		error_message = undefined;
		status = 'SUCCESS';
		if (route && typeof route === 'string') goto(route);
	}

	return {
		get status() {
			return status;
		},
		get error_message() {
			return error_message;
		},
		loading,
		error,
		success,
	};
}
