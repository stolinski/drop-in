<script lang="ts">
	import { pass } from '@drop-in/pass/client';
	import { get_z_options, z } from '$lib/z.svelte';
	import { goto } from '$app/navigation';
	import { Signup, AuthForm } from '@drop-in/ramps';
	const auth_form = new AuthForm();

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		auth_form.loading();
		const form = e.target as HTMLFormElement;
		if (!form) return;

		const email = form.email.value;
		const password = form.password.value;

		try {
			if (!email || !password) {
				throw new Error('Email and password are required');
			}

			if (!email.includes('@')) {
				throw new Error('Please enter a valid email address');
			}

			// Hits the server to signup
			const res = await pass.signup(email, password);

			// Check if we got the expected response
			if (res.status === 'success') {
				// Toast and redirect
				z.close();
				z.build(get_z_options());
				auth_form.success();
				goto('/');
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
		}
	}
</script>

<Signup title_element="h1" {onsubmit} {auth_form} />
