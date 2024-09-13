<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { toaster } from './toaster.svelte';
	export let message;

	let progress = tweened(100, { duration: message.duration });

	onMount(async () => {
		progress.set(0).then(() => {
			toaster.remove(message.id);
		});
	});

	let icon = 'ℹ️';

	if (message.type === 'SUCCESS') {
		icon = '✅';
	} else if (message.type === 'WARNING') {
		icon = '⚠️';
	} else if (message.type === 'ERROR') {
		icon = '❌';
	}
</script>

<div class="di-toast-slice">
	<p>{icon} {message.message}</p>
	<div class="progress {message.type.toLowerCase()}" style={`width: ${$progress}%;`}></div>
</div>

<style>
	.di-toast-slice {
		background: var(--bg);
		box-shadow: var(--bs-m);
		border-radius: var(--rad-s);
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
