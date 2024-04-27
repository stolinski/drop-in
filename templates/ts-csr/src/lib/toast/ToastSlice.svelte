<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { toast } from './toast.svelte';
	export let message;

	let progress = tweened(100, { duration: message.duration });

	onMount(async () => {
		progress.set(0).then(() => {
			toast.remove(message.id);
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

<div class="toast-slice">
	<p>{icon} {message.message}</p>
	<div class="progress {message.type.toLowerCase()}" style={`width: ${$progress}%;`}></div>
</div>

<style>
	.toast-slice {
		position: relative;
		padding-inline: 8px;
		padding-block: 12px;
		margin-block-start: 0.5rem;
	}

	.progress {
		height: 8px;
		background: var(--info, blue);
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
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
