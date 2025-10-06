<script lang="ts">
	import Dialog from './Dialog.svelte';
	import { toaster } from './toast/toaster.svelte.js';

	let {
		modal: _dialog = $bindable(),
		url,
		title,
		text,
		twitter_account,
		after_copy,
		active = $bindable(false)
	}: {
		modal?: HTMLDialogElement;
		url: string;
		title: string;
		text: string;
		show_button: boolean;
		twitter_account?: string;
		after_copy?: () => unknown;
		active?: boolean;
	} = $props();

	function copy() {
		navigator.clipboard.writeText(decodeURIComponent(url));
		toaster.info('Copied to clipboard');
		if (after_copy) after_copy();
	}
</script>

<Dialog button_text="Share" show_button={true} buttons={false} title="Share" {active}>
	<section aria-label="Share Window" class="share-window">
		<button type="button" class="button di-share-button" onclick={copy}>Link</button>
		<a
			class="button di-share-button di-share-share--x"
			target="_blank"
			href="https://twitter.com/intent/tweet?url={url}&text={text}&via={twitter_account}"
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
</Dialog>
