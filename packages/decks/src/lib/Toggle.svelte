<script lang="ts">
	let {
		value = $bindable('left'),
		left_label = 'Left',
		right_label = 'Right',
		onchange,
		class: _class,
		...rest
	}: {
		value?: 'left' | 'right';
		left_label?: string;
		right_label?: string;
		onchange?: (value: 'left' | 'right') => void;
		class?: string;
	} = $props();

	function select(side: 'left' | 'right') {
		value = side;
		onchange?.(side);
	}
</script>

<div class="di-toggle {_class ?? ''}" {...rest}>
	<button
		type="button"
		class:active={value === 'left'}
		onclick={() => select('left')}
		aria-pressed={value === 'left'}
	>
		{left_label}
	</button>
	<button
		type="button"
		class:active={value === 'right'}
		onclick={() => select('right')}
		aria-pressed={value === 'right'}
	>
		{right_label}
	</button>
</div>

<style>
	.di-toggle {
		display: inline-flex;
		gap: 0;
		border: 1px solid var(--c-border, #ccc);
		border-radius: 6px;
		overflow: hidden;
	}

	button {
		padding: 8px 16px;
		border: none;
		background: transparent;
		cursor: pointer;
		transition: background-color 150ms ease;
		font-size: inherit;
		font-family: inherit;
		color: inherit;
	}

	button + button {
		border-left: 1px solid var(--c-border, #ccc);
	}

	button.active {
		background: var(--c-active, #007bff);
		color: var(--c-active-text, white);
	}

	button:not(.active):hover {
		background: var(--c-hover, #f0f0f0);
	}

	button:focus-visible {
		outline: 2px solid var(--c-focus, #007bff);
		outline-offset: -2px;
		z-index: 1;
	}
</style>
