type Focusable = HTMLElement & { disabled?: boolean; tabIndex?: number };

function isFocusable(el: Element | null): el is Focusable {
	if (!el || !(el instanceof HTMLElement)) return false;
	const node = el as Focusable;
	if (node.tabIndex && node.tabIndex < 0) return false;
	const focusableSelectors = [
		'a[href]',
		'area[href]',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'button:not([disabled])',
		'iframe',
		'object',
		'embed',
		'[tabindex]:not([tabindex="-1"])',
		'[contenteditable="true"]'
	];
	return focusableSelectors.some((sel) => node.matches?.(sel));
}

export type FocusScopeController = {
	activate: () => void;
	deactivate: () => void;
};

// Keep a simple stack of active focus containers so only the topmost traps
const focusStack: HTMLElement[] = [];

export function createFocusScope(
	container: HTMLElement,
	initial?: HTMLElement | null
): FocusScopeController {
	let previouslyFocused: HTMLElement | null = null;
	let active = false;

	function isTopMost() {
		return focusStack[focusStack.length - 1] === container;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!active || !isTopMost() || event.key !== 'Tab') return;
		const focusables = Array.from(container.querySelectorAll<HTMLElement>('*')).filter(isFocusable);
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === first) {
				event.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	function handleFocusIn(e: FocusEvent) {
		if (!active || !isTopMost()) return;
		if (!container.contains(e.target as Node)) {
			const focusables = Array.from(container.querySelectorAll<HTMLElement>('*')).filter(
				isFocusable
			);
			focusables[0]?.focus();
		}
	}

	function activate() {
		if (active) return;
		active = true;
		previouslyFocused = (document.activeElement as HTMLElement) ?? null;
		focusStack.push(container);
		container.addEventListener('keydown', handleKeydown);
		document.addEventListener('focusin', handleFocusIn, true);
		// focus initial or first
		const target =
			initial && isFocusable(initial)
				? initial
				: (Array.from(container.querySelectorAll<HTMLElement>('*')).find(isFocusable) as
						| HTMLElement
						| undefined);
		target?.focus();
	}

	function deactivate() {
		if (!active) return;
		active = false;
		container.removeEventListener('keydown', handleKeydown);
		document.removeEventListener('focusin', handleFocusIn, true);
		// remove from stack regardless of position
		const idx = focusStack.lastIndexOf(container);
		if (idx !== -1) focusStack.splice(idx, 1);
		previouslyFocused?.focus({ preventScroll: true });
	}

	return { activate, deactivate };
}
