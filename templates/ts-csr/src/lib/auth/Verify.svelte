<!-- TODO -->
<!-- If you would like to contribute below is the method to request verification -->
<script lang="ts">
	import { users } from '$/pocketbase';
	// TODO
	// NOT COMPLETE
	async function onclick() {
		// TODO Email from user email
		await users.requestVerification('test@example.com');
		// Success State
		// Hide if already verified
	}
</script>

<div>
	<p>
		Your email is not verified.
		<button {onclick}> Send Verification </button>
	</p>
</div>

<style>
	div {
		padding: 20px;
	}
	p {
		margin: 0;
		text-align: center;
	}
</style>
