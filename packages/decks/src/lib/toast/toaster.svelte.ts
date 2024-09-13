type ToastType = 'SUCCESS' | 'INFO' | 'ERROR' | 'WARNING';

interface ToastOptions {
	type?: ToastType;
	duration?: number;
	id?: string;
}

type Toast = {
	type: ToastType;
	message: string;
	duration: number;
	id: string;
};

function cook_toast() {
	let toasts: Toast[] = $state([]);
	const status: 'ON' | 'OFF' = $derived(toasts.length > 0 ? 'ON' : 'OFF');

	function send(
		message: string,
		{ type = 'INFO', duration = 3000, id = 'toast-' + Math.random() }: ToastOptions = {}
	) {
		toasts.push({ message, type, duration, id });
	}

	function clear() {
		toasts = [];
	}
	function info(
		message: string,
		{ duration = 3000, id = 'toast-' + Math.random() }: ToastOptions = {}
	) {
		send(message, { duration, id });
	}

	function success(
		message: string,
		{ duration = 3000, id = 'toast-' + Math.random() }: ToastOptions = {}
	) {
		send(message, { duration, id, type: 'SUCCESS' });
	}

	function error(
		message: string,
		{ duration = 3000, id = 'toast-' + Math.random() }: ToastOptions = {}
	) {
		send(message, { duration, id, type: 'ERROR' });
	}

	function warning(
		message: string,
		{ duration = 3000, id = 'toast-' + Math.random() }: ToastOptions = {}
	) {
		send(message, { duration, id, type: 'WARNING' });
	}

	function remove(id: string) {
		toasts = toasts.filter((toast) => toast.id !== id);
	}

	return {
		send,
		clear,
		remove,
		info,
		success,
		error,
		warning,
		get toasts() {
			return toasts;
		},
		get status() {
			return status;
		}
	};
}

export const toaster = cook_toast();
