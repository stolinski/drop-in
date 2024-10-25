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
			const res = await pass.signup(email, password);
			console.log('res', res);
			// auth.success();
		} catch (e) {
			auth.error(e.data.data.password.message);
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
