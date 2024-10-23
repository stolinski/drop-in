<script lang="ts">
	import { page } from '$app/stores';
	import { users } from '$/pocketbase';
	import { auth_form_state } from '$lib/auth/auth_form.svelte';
	import { toaster } from '@drop-in/decks';
	const auth = auth_form_state();
	const loading = $derived(auth.status === 'LOADING');

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		auth.loading();
		const form = e.target as HTMLFormElement;
		if (!form) return;

		const password = form.password.value;
		const passwordConfirm = form.passwordConfirm.value;
		const { token } = $page.params;

		try {
			await users.confirmPasswordReset(token, password, passwordConfirm);
			toaster.success('Password reset successful');
			auth.success();
		} catch (e) {
			auth.error('Password reset failed');
		}
	}
</script>

<h1>Reset Password</h1>
<form method="post" {onsubmit}>
	<div>
		<label for="password">New Password</label>
		<input type="password" name="password" id="password" /><br />
	</div>
	<div>
		<label for="passwordConfirm">New Password Confirm</label>
		<input type="password" name="passwordConfirm" id="passwordConfirm" /><br />
	</div>
	<button type="submit" disabled={loading}>
		{#if loading}Resetting...{:else}
			Reest Password
		{/if}
	</button>
</form>

{#if auth.error_message}
	<p class="error">{auth.error_message}</p>
{/if}

<p>
	Need an account?
	<a href="/auth/signup">Sign Up</a>
</p>

<p>
	<a href="/auth/forgot-password">Forgot your password?</a>
</p>
