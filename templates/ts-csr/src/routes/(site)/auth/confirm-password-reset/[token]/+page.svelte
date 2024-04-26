<script lang="ts">
	import { page } from '$app/stores';
	import { users } from '$/pocketbase';
	import { auth_form_state } from '$lib/auth/auth_form.svelte';
	const auth = auth_form_state();
	const loading = $derived(auth.status === 'LOADING');

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		auth.loading();
		const form = e.target as HTMLFormElement;
		if (!form) return;

		const email = form.email.value;
		const password = form.password.value;

		users
			.authWithPassword(email, password)
			.then((data) => {
				auth.success();
			})
			.catch((e) => {
				console.error(e);
				auth.error(e.data.data.password.message);
				// Write your own messages here if you want to change the error message
			});
	}
	const params = $page.params;
	console.log('params', params.token);
	// TODO implement this
	// await pb.collection('users').confirmPasswordReset('TOKEN', '1234567890', '1234567890');
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

<!-- TODO -->
