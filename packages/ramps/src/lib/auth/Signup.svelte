<script lang="ts">
	const { title_element = 'h1', onsubmit, auth_form } = $props();
	const loading = $derived(auth_form.status === 'LOADING');
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
	{#if auth_form.error_message}
		<p class="error">{auth_form.error_message}</p>
	{/if}
</div>
<div class="row">
	<p>Already have an account?</p>
	<a href="/auth/login">Sign in</a>
</div>
