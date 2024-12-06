<script lang="ts">
	import { AuthForm } from './auth_form.svelte';
	import { pass } from '@drop-in/pass/client';

	const auth = new AuthForm();
	const loading = $derived(auth.status === 'LOADING');
	const { title_element = 'h1' } = $props();

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		auth.loading();
		const form = e.target as HTMLFormElement;
		if (!form) return;

		const email = form.email.value;
		const password = form.password.value;

		try {
			if (!email || !password) {
				throw new Error('Email and password are required');
			}

			// Hits the server to signup
			const res = await pass.signup(email, password);

			// Check if we got the expected response
			if (res === 'Success') {
				// Toast and redirect
				auth.success();
			} else {
				// Handle unexpected response format
				throw new Error('Registration failed. Please try again.');
			}
		} catch (e) {
			// Show specific error message to user
			auth.error(e instanceof Error ? e.message : 'An unexpected error occurred');
		}
	}
</script>

<svelte:element this={title_element}>Sign up</svelte:element>
<form method="post" {onsubmit}>
	<div class="row">
		<label for="email">Email</label>
		<input name="email" id="email" type="email" /><br />
	</div>
	<div class="row">
		<label for="password">Password</label>
		<input required type="password" name="password" id="password" /><br />
	</div>
	<button type="submit" disabled={loading}
		>{#if loading}Signing up...{:else}
			Sign Me Up
		{/if}</button
	>
</form>
<div class="row">
	{#if auth.error_message}
		<p class="error">{auth.error_message}</p>
	{/if}
</div>
<div class="row">
	<p>Already have an account?</p>
	<a href="/auth/login">Sign in</a>
</div>
