<script lang="ts">
	import { users } from '$/pocketbase';
	import { toast } from '../../packages/@slick-kit/toast/toast.svelte';
	import { auth_form_state } from './auth_form.svelte';
	const auth = auth_form_state();
	const loading = $derived(auth.status === 'LOADING');

	async function onsubmit(e: SubmitEvent) {
		// ! IMPORTANT: If this is not firing an email head to YOUR_PB_URL/_/#/settings/mail and Send Test Email to confirm PB email is sending.
		e.preventDefault();
		auth.loading();
		const form = e.target as HTMLFormElement;
		if (!form) return;

		const email = form.email.value;

		users
			.requestPasswordReset(email)
			.then(() => {
				toast.success('Password reset email sent');
				auth.success(false);
			})
			.catch((e) => {
				console.error(e);
				auth.error(e.data.data.password.message);
				// Write your own messages here if you want to change the error message
			});
	}
</script>

<h1>Forgot Password</h1>
{#if auth.status === 'SUCCESS'}
	<p>Please check your email for password reset instructions</p>
{:else}
	<form method="post" {onsubmit}>
		<div>
			<label for="email">Email</label>
			<input required name="email" id="email" type="email" /><br />
		</div>
		<button type="submit" disabled={loading}>
			{#if loading}Sending...{:else}
				Request Password Reset
			{/if}
		</button>
	</form>

	{#if auth.error_message}
		<p class="error">{auth.error_message}</p>
	{/if}
{/if}

<p>
	Need an account?
	<a href="/auth/signup">Sign Up</a>
</p>
<p>
	Know your account?
	<a href="/auth/login">Login</a>
</p>
