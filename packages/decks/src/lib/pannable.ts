/**
 * Pannable gesture utility - Refined for Phase 2
 *
 * Features:
 * - Modern pointer events (touch/mouse/pen unified)
 * - Passive listeners for scroll performance
 * - Cancellation on scroll/escape key
 * - Type-safe event payloads
 * - Velocity calculation (X and Y)
 *
 * @example
 * ```svelte
 * <div {@attach pannable}
 *      onpanstart={(e) => console.log('start', e.detail)}
 *      onpanmove={(e) => console.log('move', e.detail.dx, e.detail.dy)}
 *      onpanend={(e) => console.log('end', e.detail.velocityX, e.detail.velocityY)}
 *      onpancancel={() => console.log('canceled')}>
 *   Drag me
 * </div>
 * ```
 */

/**
 * Event detail for panstart event
 */
export interface PanStartDetail {
	/** Initial X position in viewport coordinates */
	x: number;
	/** Initial Y position in viewport coordinates */
	y: number;
}

/**
 * Event detail for panmove event
 */
export interface PanMoveDetail {
	/** Current X position in viewport coordinates */
	x: number;
	/** Current Y position in viewport coordinates */
	y: number;
	/** Delta X since last move event */
	dx: number;
	/** Delta Y since last move event */
	dy: number;
}

/**
 * Event detail for panend event
 */
export interface PanEndDetail {
	/** Final X position in viewport coordinates */
	x: number;
	/** Final Y position in viewport coordinates */
	y: number;
	/** Total delta X since panstart */
	dx: number;
	/** Total delta Y since panstart */
	dy: number;
	/** Horizontal velocity in pixels per millisecond */
	velocityX: number;
	/** Vertical velocity in pixels per millisecond */
	velocityY: number;
}

interface PositionHistory {
	x: number;
	y: number;
	timestamp: number;
}

/**
 * Pannable attachment - adds pan gesture support to an element
 *
 * Emits custom events:
 * - panstart: when pan begins
 * - panmove: during pan movement
 * - panend: when pan completes normally
 * - pancancel: when pan is canceled (scroll/escape)
 */
export function pannable(node: HTMLElement): { destroy: () => void } {
	let startX: number;
	let startY: number;
	let x: number;
	let y: number;
	const history: PositionHistory[] = [];
	const MAX_HISTORY = 5;
	let isPanning = false;
	let pointerId: number | null = null;

	function handleStart(event: PointerEvent) {
		// Only track primary pointer (first touch or left mouse button)
		if (isPanning || (event.pointerType === 'mouse' && event.button !== 0)) return;

		isPanning = true;
		pointerId = event.pointerId;
		startX = x = event.clientX;
		startY = y = event.clientY;

		// Reset history on new pan
		history.length = 0;
		history.push({ x, y, timestamp: Date.now() });

		// Capture pointer to receive move/up events even if pointer leaves element
		node.setPointerCapture(event.pointerId);

		node.dispatchEvent(
			new CustomEvent<PanStartDetail>('panstart', {
				detail: { x, y }
			})
		);

		// Listen for cancel conditions
		window.addEventListener('keydown', handleEscape);
		window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
	}

	function handleMove(event: PointerEvent) {
		// Only track the pointer we started with
		if (!isPanning || event.pointerId !== pointerId) return;

		const clientX = event.clientX;
		const clientY = event.clientY;

		const dx = clientX - x;
		const dy = clientY - y;
		x = clientX;
		y = clientY;

		// Track position history (circular buffer)
		history.push({ x: clientX, y: clientY, timestamp: Date.now() });
		if (history.length > MAX_HISTORY) {
			history.shift();
		}

		node.dispatchEvent(
			new CustomEvent<PanMoveDetail>('panmove', {
				detail: { x, y, dx, dy }
			})
		);
	}

	function handleEnd(event: PointerEvent) {
		// Only handle the pointer we started with
		if (!isPanning || event.pointerId !== pointerId) return;

		cleanup();

		const clientX = event.clientX;
		const clientY = event.clientY;

		const dx = clientX - startX;
		const dy = clientY - startY;

		// Calculate velocity from position history
		let velocityX = 0;
		let velocityY = 0;
		if (history.length >= 2) {
			const oldest = history[0];
			const newest = history[history.length - 1];
			const deltaX = newest.x - oldest.x;
			const deltaY = newest.y - oldest.y;
			const deltaTime = newest.timestamp - oldest.timestamp;
			if (deltaTime > 0) {
				velocityX = Math.abs(deltaX / deltaTime); // px per ms
				velocityY = Math.abs(deltaY / deltaTime); // px per ms
			}
		}

		node.dispatchEvent(
			new CustomEvent<PanEndDetail>('panend', {
				detail: { x: clientX, y: clientY, dx, dy, velocityX, velocityY }
			})
		);
	}

	function handleCancel() {
		if (!isPanning) return;

		cleanup();

		node.dispatchEvent(new CustomEvent('pancancel'));
	}

	function handleEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}

	function handleScroll() {
		// Cancel pan if user scrolls
		handleCancel();
	}

	function cleanup() {
		isPanning = false;
		if (pointerId !== null) {
			try {
				node.releasePointerCapture(pointerId);
			} catch {
				// Ignore errors if pointer capture already released
			}
			pointerId = null;
		}
		history.length = 0;
		window.removeEventListener('keydown', handleEscape);
		window.removeEventListener('scroll', handleScroll, { capture: true });
	}

	// Use pointer events for unified touch/mouse/pen handling
	node.addEventListener('pointerdown', handleStart);
	node.addEventListener('pointermove', handleMove);
	node.addEventListener('pointerup', handleEnd);
	node.addEventListener('pointercancel', handleCancel);

	return {
		destroy() {
			cleanup();
			node.removeEventListener('pointerdown', handleStart);
			node.removeEventListener('pointermove', handleMove);
			node.removeEventListener('pointerup', handleEnd);
			node.removeEventListener('pointercancel', handleCancel);
		}
	};
}
