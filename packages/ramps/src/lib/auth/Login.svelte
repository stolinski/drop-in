<script lang="ts">
	const { title_element = 'h1', onsubmit, auth_form } = $props();
	const loading = $derived(auth_form.status === 'LOADING');
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
		<a href="/signup">Sign Up</a>
	</p>

	<p>
		<!-- <a href="/forgot-password">Forgot your password?</a> -->
	</p>
</div>
