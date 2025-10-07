<script>
	import { tweened } from 'svelte/motion';
	import { toaster } from './toaster.svelte';
	import { isReducedMotion } from '../motion.js';

	let { message } = $props();

	let progress = tweened(100, { duration: isReducedMotion() ? 0 : message.duration });

	$effect(() => {
		progress.set(0).then(() => {
			toaster.remove(message.id);
		});
	});

	const icon = $derived(
		message.type === 'SUCCESS'
			? '✅'
			: message.type === 'WARNING'
				? '⚠️'
				: message.type === 'ERROR'
					? '❌'
					: 'ℹ️'
	);
</script>

<div class="di-toast-slice">
	<p>{icon} {message.message}</p>
	<div class="progress {message.type.toLowerCase()}" style={`width: ${$progress}%;`}></div>
</div>

<style>
	.di-toast-slice {
		background: var(--c-bg);
		box-shadow: var(--s-m);
		border-radius: var(--br-s);
		padding: var(--pad-m) var(--pad-l);
		flex-direction: column;
		border: solid 1px var(--tint);
		z-index: 10;
		overflow: hidden;
		position: relative;
	}

	.progress {
		height: 5px;
		background: var(--info, blue);
		position: absolute;
		inset: auto 0 0 0;
	}

	.progress.success {
		background: var(--success, green);
	}
	.progress.warning {
		background: var(--warning, yellow);
	}
	.progress.error {
		background: var(--error, red);
	}

	p {
		margin: 0;
	}
</style>
