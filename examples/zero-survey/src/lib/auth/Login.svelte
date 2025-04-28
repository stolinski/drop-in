<script lang="ts">
	import { pass } from '@drop-in/pass/client';
	// Q: Why is this a component and not just a page?
	// A: You might want to drop it anywhere you want, it will work.
	import { AuthForm } from './auth_form.svelte';
	import { Zero } from '@rocicorp/zero';
	import { getZ, get_z_options } from '$lib/z.svelte';
	let cache = getZ();
	const { title_element = 'h1' } = $props();
	const auth_form = new AuthForm();
	const loading = $derived(auth_form.status === 'LOADING');

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		auth_form.loading();

		const form = e.target as HTMLFormElement;
		if (!form) return;

		const email = form.email.value;
		const password = form.password.value;

		try {
			// Validate input
			if (!email || !password) {
				throw new Error('Email and password are required');
			}

			if (!email.includes('@')) {
				throw new Error('Please enter a valid email address');
			}

			const res = await pass.login(email, password);

			// Check response status
			if (res.status === 'success') {
				cache.z = new Zero(get_z_options());
				auth_form.success();
				// Optional: Add redirect logic here
				// window.location.href = '/dashboard';
			} else if (res.error) {
				// Handle specific error from server
				auth_form.error(res.error);
			} else {
				// Handle unexpected response format
				throw new Error('Login failed. Please try again.');
			}
		} catch (e) {
			// Show specific error message to user
			auth_form.error(e instanceof Error ? e.message : 'An unexpected error occurred');

			// Optional: Clear password field on error
			const passwordInput = form.password as HTMLInputElement;
			if (passwordInput) {
				passwordInput.value = '';
			}
		}
	}
</script>

<svelte:element this={title_element}>Login</svelte:element>
<form method="post" {onsubmit}>
	<div class="row">
		<label for="email">Email</label>
		<input required type="email" name="email" id="email" /><br />
	</div>
	<div class="row">
		<label for="password">Password</label>
		<input required type="password" name="password" id="password" /><br />
	</div>
	<button type="submit" disabled={loading}>
		{#if loading}Logging in...{:else}
			Log Me In Please
		{/if}
	</button>
</form>

<div class="row">
	{#if auth_form.error_message}
		<p class="error">{auth_form.error_message}</p>
	{/if}
</div>

<div class="row">
	<p>
		Need an account?
		<a href="/auth/signup">Sign Up</a>
	</p>

	<p>
		<a href="/auth/forgot-password">Forgot your password?</a>
	</p>
</div>
