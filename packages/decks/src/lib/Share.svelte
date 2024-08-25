<script lang="ts">
	let {
		modal = $bindable(),
		url,
		title,
		text,
		twitter_account,
		after_copy,
		active
	}: {
		modal?: HTMLDialogElement;
		url: string;
		title: string;
		text: string;
		twitter_account?: string;
		after_copy?: () => unknown;
		active?: boolean;
	} = $props();

	async function share() {
		const is_possibly_mobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		if (is_possibly_mobile && navigator?.share) {
			try {
				await navigator.share({
					url,
					text,
					title
				});
			} catch (err) {
				// This is here because navigator throws AbortError if the user cancels the share
				return;
			}
		} else {
			modal.showModal();
		}
	}

	$effect(() => {
		if (active) {
			modal.showModal();
		} else {
			modal.close();
		}
	});

	function copy() {
		navigator.clipboard.writeText(decodeURIComponent(url));
		if (after_copy) after_copy();
	}

	function close() {
		modal.close();
	}
</script>

<button class="share" onclick={share}>Share</button>

<dialog bind:this={modal} class="di-share" aria-labelledby="share-header">
	<button onclick={close} class="di-share-close">×</button>
	<h3>Share</h3>
	<section aria-label="Share Window" class="share-window">
		<button class="button di-share-button" onclick={copy}>Link</button>
		<a
			class="button di-share-button di-share-share--x"
			target="_blank"
			href="https://twitter.com/intent/tweet?url={url}&text={title}&via={twitter_account}"
		>
			X</a
		>
		<a
			class="button di-share-button di-share-share--facebook"
			target="_blank"
			href="https://facebook.com/sharer/sharer.php?u={url}&quote={title}">Facebook</a
		>
		<a
			target="_blank"
			class="button di-share-button di-share-share--linkedin"
			href="https://www.linkedin.com/sharing/share-offsite/?url={url}"
		>
			LinkedIn</a
		>
	</section>
</dialog>
