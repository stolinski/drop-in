let lockCount = 0;
let previousOverflow: string | null = null;

export function lockScroll() {
	lockCount += 1;
	if (lockCount === 1) {
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}
}

export function unlockScroll() {
	if (lockCount === 0) return;
	lockCount -= 1;
	if (lockCount === 0) {
		document.body.style.overflow = previousOverflow ?? '';
		previousOverflow = null;
	}
}
