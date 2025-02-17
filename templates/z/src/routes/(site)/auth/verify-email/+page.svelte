<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { pass } from '@drop-in/pass/client';

	$effect(() => {
		const token = page.url.searchParams.get('token');
		const email = page.url.searchParams.get('email');
		const expire = page.url.searchParams.get('expire');

		if (!token || !email || !expire) {
			return;
		}

		pass
			.verifyEmail(token, email, parseInt(expire))
			.then(() => {
				goto('/');
			})
			.catch((e) => {
				console.error(e);
			});
	});
</script>

<p>Verifying email...</p>
