export function pannable(node: HTMLElement) {
	let x: number;
	let y: number;

	function handleStart(event: MouseEvent | TouchEvent) {
		if (event.type === 'touchstart') {
			const touch = (event as TouchEvent).touches[0];
			x = touch.clientX;
			y = touch.clientY;
		} else {
			x = (event as MouseEvent).clientX;
			y = (event as MouseEvent).clientY;
		}

		node.dispatchEvent(
			new CustomEvent('panstart', {
				detail: { x, y }
			})
		);

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('touchmove', handleMove, { passive: false });
		window.addEventListener('mouseup', handleEnd);
		window.addEventListener('touchend', handleEnd);
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

		node.dispatchEvent(
			new CustomEvent('panmove', {
				detail: { x, y, dx, dy }
			})
		);
	}

	function handleEnd(event: MouseEvent | TouchEvent) {
		let clientX: number, clientY: number;

		if (event.type === 'touchend') {
			const touch = (event as TouchEvent).changedTouches[0];
			clientX = touch.clientX;
			clientY = touch.clientY;
		} else {
			clientX = (event as MouseEvent).clientX;
			clientY = (event as MouseEvent).clientY;
		}

		const dx = clientX - x;
		const dy = clientY - y;

		node.dispatchEvent(
			new CustomEvent('panend', {
				detail: { x: clientX, y: clientY, dx, dy }
			})
		);

		window.removeEventListener('mousemove', handleMove);
		window.removeEventListener('touchmove', handleMove);
		window.removeEventListener('mouseup', handleEnd);
		window.removeEventListener('touchend', handleEnd);
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
