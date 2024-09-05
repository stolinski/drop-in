// CODE FROM
//https://github.com/AndrewLester/svelte-animated-details/blob/main/src/routes/%2Bpage.svelte
import type { Action } from 'svelte/action';

const defaultOptions: KeyframeAnimationOptions = {
	duration: 400,
	easing: 'ease-out'
};

export const animatedDetails: Action<HTMLDetailsElement, KeyframeAnimationOptions | undefined> = (
	element: HTMLDetailsElement,
	options = defaultOptions
) => {
	const summary = element.querySelector('summary');
	if (!summary) return {};

	options = {
		...defaultOptions,
		...options
	};

	const { overflow } = getComputedStyle(element);

	if (overflow !== 'hidden' && overflow !== 'clip') {
		console.warn(
			'Using animated details on a details element which does not use overflow hidden or clip.'
		);
	}

	let transitioning = false;

	const animatePanel = (opening: boolean) => {
		transitioning = true;

		if (opening) {
			element.open = true;
		}

		const blockSizeKeyframes = [`${summary['offsetHeight']}px`, `${element['clientHeight']}px`];

		if (!opening) {
			blockSizeKeyframes.reverse();
		}

		const animation = element.animate(
			{
				blockSize: blockSizeKeyframes
			},
			options
		);

		animation.oncancel =
			animation.onfinish =
			animation.onremove =
				() => {
					if (!opening) {
						element.open = false;
					}

					transitioning = false;
				};
	};

	const onClick = (e: Event) => {
		e.preventDefault();

		if (transitioning) return;

		animatePanel(!element.open);
	};

	const onMutate: MutationCallback = (mutationList) => {
		for (const mutation of mutationList) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'open') {
				if (transitioning) return;

				if (element.open) {
					animatePanel(true);
				}
			}
		}
	};

	const observer = new MutationObserver(onMutate);
	observer.observe(element, { attributes: true });
	summary.addEventListener('click', onClick);

	return {
		destroy() {
			observer.disconnect();
			summary.removeEventListener('click', onClick);
		},
		update(newOptions: KeyframeAnimationOptions = defaultOptions) {
			options = {
				...options,
				...newOptions
			};
		}
	};
};
export default animatedDetails;
