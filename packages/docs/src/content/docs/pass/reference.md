---
title: Reference
description: A reference page for Pass, the Drop In auth.
---

## What is @drop-in/pass?

This is the auth package for Drop In. It's JWT based and uses a Drizzle Schema to manage migrations and data for logins and profiles.

## How does it work?

Drop In sets up Pass for you automatically on app creation. Check `/src/hooks.server.ts` and you will find the following.

```ts
import { sequence } from '@sveltejs/kit/hooks';
import { pass_routes } from '@drop-in/pass';
import { drop_hook } from '@drop-in/plugin/hook';

// ? What's up with the two hooks?
// Pass Routes is the hook for auth authentication, it includes the routes where auth is handeled.
// Drop hook adds a global so our drop-in.config.js is read and applied to globals

export const handle = sequence(pass_routes, drop_hook);
```

Don't delete these if you would like Pass to work.

`pass_routes` is a set of routes to handle the server response for logging in, out, signing up, resetting password and verifying email. This means you don't need to add or manage any server side routes for `@drop-in/pass`.

## How do I login / signup ect

Inside of `/src/routes/(site)/auth` you will find a number of routes for all auth functions.

Most of these routes have something that looks like this.

```svelte
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
```

This includes a function that handles all login logic. You can customize this logic, but DO NOT remove the `z.` methods.

`<Signup ...>` is the template, it comes from `@drop-in/ramps`. To access these templates and customize them use the "pick" command (coming soon).

## That's it

You shouldn't need to customize too much more other than the redirect logic or pick a template and tweak the html or css.
