<script lang="ts">
	// Q: Why is this a component and not just a page?
	// A: You might want to drop it anywhere you want, it will work.
	import { users } from '$/pocketbase';
	import { auth_form_state } from './auth_form.svelte';
	const auth = auth_form_state();
	const loading = $derived(auth.status === 'LOADING');

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		auth.loading();
		const form = e.target as HTMLFormElement;
		console.log('form', form);
		if (!form) return;

		const email = form.email.value;
		const password = form.password.value;

		users
			.authWithPassword(email, password)
			.then((data) => {
				console.log('data', data);
				auth.success();
			})
			.catch((e) => {
				console.error(e);
				auth.error(e.message);
				// Write your own messages here if you want to change the error message
			});
	}
</script>

<h1>Login</h1>
<form method="post" {onsubmit}>
	<div>
		<label for="email">Email</label>
		<input required type="email" name="email" id="email" /><br />
	</div>
	<div>
		<label for="password">Password</label>
		<input required type="password" name="password" id="password" /><br />
	</div>
	<button type="submit" disabled={loading}>
		{#if loading}Logging in...{:else}
			Log Me In Please
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
