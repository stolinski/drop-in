interface PositionHistory {
	x: number;
	y: number;
	timestamp: number;
}

export function pannable(node: HTMLElement) {
	let x: number;
	let y: number;
	const history: PositionHistory[] = [];
	const MAX_HISTORY = 5;

	function handleStart(event: MouseEvent | TouchEvent) {
		if (event.type === 'touchstart') {
			const touch = (event as TouchEvent).touches[0];
			x = touch.clientX;
			y = touch.clientY;
		} else {
			x = (event as MouseEvent).clientX;
			y = (event as MouseEvent).clientY;
		}

		// Reset history on new pan
		history.length = 0;
		history.push({ x, y, timestamp: Date.now() });

		node.dispatchEvent(
			new CustomEvent('panstart', {
				detail: { x, y }
			})
		);

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('touchmove', handleMove, { passive: false });
		window.addEventListener('mouseup', handleEnd);
		window.addEventListener('touchend', handleEnd);
		window.addEventListener('touchcancel', handleEnd);
	}

	function handleMove(event: MouseEvent | TouchEvent) {
		let clientX: number, clientY: number;

		if (event.type === 'touchmove') {
			const touch = (event as TouchEvent).touches[0];
			clientX = touch.clientX;
			clientY = touch.clientY;
		} else {
			clientX = (event as MouseEvent).clientX;
			clientY = (event as MouseEvent).clientY;
		}

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
			new CustomEvent('panmove', {
				detail: { x, y, dx, dy }
			})
		);
	}

	function handleEnd(event: MouseEvent | TouchEvent) {
		let clientX: number, clientY: number;

		if (event.type === 'touchend' || event.type === 'touchcancel') {
			const touch = (event as TouchEvent).changedTouches[0];
			clientX = touch.clientX;
			clientY = touch.clientY;
		} else {
			clientX = (event as MouseEvent).clientX;
			clientY = (event as MouseEvent).clientY;
		}

		const dx = clientX - x;
		const dy = clientY - y;

		// Calculate velocity from position history
		let velocityY = 0;
		if (history.length >= 2) {
			const oldest = history[0];
			const newest = history[history.length - 1];
			const deltaY = newest.y - oldest.y;
			const deltaTime = newest.timestamp - oldest.timestamp;
			if (deltaTime > 0) {
				velocityY = Math.abs(deltaY / deltaTime); // px per ms
			}
		}

		node.dispatchEvent(
			new CustomEvent('panend', {
				detail: { x: clientX, y: clientY, dx, dy, velocityY }
			})
		);

		window.removeEventListener('mousemove', handleMove);
		window.removeEventListener('touchmove', handleMove);
		window.removeEventListener('mouseup', handleEnd);
		window.removeEventListener('touchend', handleEnd);
		window.removeEventListener('touchcancel', handleEnd);
	}

	node.addEventListener('mousedown', handleStart);
	node.addEventListener('touchstart', handleStart, { passive: false });

	return {
		destroy() {
			node.removeEventListener('mousedown', handleStart);
			node.removeEventListener('touchstart', handleStart);
		}
	};
}
