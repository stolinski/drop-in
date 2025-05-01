<script lang="ts">
	import { pass } from '@drop-in/pass/client';
	import type { User } from '@drop-in/pass/schema';

	const { user }: { user: User } = $props();

	let verified_sent = $state(false);

	async function onclick() {
		try {
			await pass.sendVerifyEmail(user.id);
			verified_sent = true;
		} catch (e) {
			console.error(e);
		}
	}
</script>

<div>
	{#if !verified_sent}
		<p>
			Your email is not verified.
			<button class="btn-small" {onclick}> Send Verification </button>
		</p>
	{:else}
		<p>Verification email sent to {user.email}.<br /> Please check your email.</p>
	{/if}
</div>

<style>
	div {
		padding: 10px 5px;
	}
	p {
		margin: 0;
		text-align: center;
	}
	button {
		display: inline-block;
	}
</style>
