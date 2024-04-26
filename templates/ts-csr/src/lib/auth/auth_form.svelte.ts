import { settings } from "$settings";
import { goto } from "$app/navigation";

export function auth_form_state() {
	let status: 'LOADING' | 'SUCCESS' | 'ERROR' | 'INITIAL' = $state('INITIAL');
	let error_message: string | undefined = $state();

	function loading() {
		status = 'LOADING'
	}
	function error(e_message: string) {
		status = 'ERROR'
		error_message = e_message
	}

	function success() {
		error_message = undefined
		status = 'SUCCESS'
		goto(settings.app_route);
	}

	return {
		get status() {
			return status
		},
		get error_message() {
			return error_message
		},
		loading,
		error,
		success
	}
}