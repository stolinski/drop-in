<script lang="ts">
	const { user } = $props();

	let verified_sent = $state(false);

	async function onclick() {
		// TODO: Request Verification
		// await users.requestVerification(user.email)
		verified_sent = true;
	}
</script>

<div>
	{#if !verified_sent}
		<p>
			Your email is not verified.
			<button class="btn-small" {onclick}> Send Verification </button>
		</p>
	{:else}
		<p>Verification email sent to {user.email}. Please check your email.</p>
	{/if}
</div>

<style>
	div {
		padding: 20px;
	}
	p {
		margin: 0;
		text-align: center;
	}
	button {
		display: inline-block;
	}
</style>
