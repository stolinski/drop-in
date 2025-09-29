type EscapeHandler = (event: KeyboardEvent) => void;

let listening = false;
const stack: EscapeHandler[] = [];

function keydownListener(event: KeyboardEvent) {
	if (event.key !== 'Escape') return;
	const handler = stack[stack.length - 1];
	if (handler) {
		event.stopPropagation();
		handler(event);
	}
}

export function onEscape(handler: EscapeHandler): () => void {
	stack.push(handler);
	if (!listening) {
		listening = true;
		document.addEventListener('keydown', keydownListener, true);
	}
	return () => {
		const idx = stack.lastIndexOf(handler);
		if (idx !== -1) stack.splice(idx, 1);
		if (stack.length === 0 && listening) {
			listening = false;
			document.removeEventListener('keydown', keydownListener, true);
		}
	};
}
