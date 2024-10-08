<script lang="ts">
	import { AuthForm } from './auth_form.svelte';
	const auth = new AuthForm();
	const loading = $derived(auth.status === 'LOADING');

	async function signup(e: SubmitEvent) {
		e.preventDefault();
		auth.loading();
		const form = e.target as HTMLFormElement;
		if (!form) return;

		const email = form.email.value;
		const password = form.password.value;
		// TODO: Signup Z code
		// try {
		// 	await users.create({
		// 		email,
		// 		password,
		// 		passwordConfirm: password, // if you want a real password confirm, just add form element and grab value.
		// 	});
		// 	await users.authWithPassword(email, password);
		// 	auth.success();
		// } catch (e) {
		// 	auth.error(e.data.data.password.message);
		// 	// Write your own messages here if you want to change the error message
		// }
	}
</script>

<h1>Sign up</h1>
<form method="post" onsubmit={signup}>
	<div>
		<label for="email">Email</label>
		<input name="email" id="email" /><br />
	</div>
	<div>
		<label for="password">Password</label>
		<input required type="password" name="password" id="password" /><br />
	</div>
	<button type="submit" disabled={loading}
		>{#if loading}Signing up...{:else}
			Sign Me Up
		{/if}</button
	>
</form>

{#if auth.error_message}
	<p class="error">{auth.error_message}</p>
{/if}

<p>Already have an account?</p>
<a href="/auth/login">Sign in</a>
