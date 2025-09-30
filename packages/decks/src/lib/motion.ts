// Motion baseline and reduced-motion utilities
//
// Tokens
// - CSS variables (override globally or per-component):
//   --di-motion-duration: base duration in ms (default 200ms)
//   --di-motion-duration-enter: enter duration (fallbacks to --di-motion-duration)
//   --di-motion-duration-exit: exit duration (fallbacks to --di-motion-duration)
//   --di-motion-ease-in: easing for enter (default cubic-bezier(0.2, 0, 0, 1))
//   --di-motion-ease-out: easing for exit (default cubic-bezier(0.2, 0, 0, 1))
//
// JS tokens
// - Use `motion.durations` and `motion.easing` in code-driven animations (e.g., Drawer)
// - Use `isReducedMotion()` to branch to no/low motion behavior

export const motion = {
	durations: {
		fast: 120,
		base: 200,
		slow: 320
	},
	easing: {
		in: 'cubic-bezier(0.2, 0, 0, 1)',
		out: 'cubic-bezier(0.2, 0, 0, 1)'
	}
} as const;

let mql: MediaQueryList | null = null;

function ensure_mql(): MediaQueryList | null {
	if (mql || typeof window === 'undefined') return mql;
	try {
		mql = window.matchMedia('(prefers-reduced-motion: reduce)');
	} catch {
		mql = null;
	}
	return mql;
}

export function isReducedMotion(): boolean {
	const q = ensure_mql();
	return q ? q.matches : false;
}

export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
	const q = ensure_mql();
	if (!q) return () => {};
	const handler = (e: MediaQueryListEvent) => cb(e.matches);
	// addEventListener is supported in modern browsers; fallback for older
	if ('addEventListener' in q) {
		q.addEventListener('change', handler);
		return () => q.removeEventListener('change', handler);
	} else {
		// @ts-expect-error legacy API
		q.addListener(handler);
		return () => {
			// @ts-expect-error legacy API
			q.removeListener(handler);
		};
	}
}

export function durationOrZero(ms: number): number {
	return isReducedMotion() ? 0 : ms;
}
