<script lang="ts">
	import { toaster } from '@drop-in/decks';

	let bundler: 'npm' | 'pnpm' = $state('npm');

	let step_1 = $derived(`${bundler === 'npm' ? 'npx' : 'pnpx'} @drop-in/new app-name`);
	let step_2 = $derived(`cd app-name
${bundler} install`);
	let step_3 = $derived(`${bundler === 'npm' ? bundler + ' run' : bundler} dev`);

	function copy(text: string) {
		navigator?.clipboard.writeText(text);
		toaster.info('Copied to clipboard');
	}
</script>

<h1>Getting Started</h1>

<h2>Which bundler do you like</h2>
<button onclick={() => (bundler = 'npm')} class:active={bundler === 'npm'}>npm</button>
<button onclick={() => (bundler = 'pnpm')} class:active={bundler === 'pnpm'}>pnpm</button>

<h2>Installation and Quickstart</h2>
<p>To use Drop In just run the new command.</p>

<h3>1 Install</h3>

<button onclick={() => copy(step_1)}>Copy</button>
<pre class="shiki shiki-themes night-owl night-owl"><code class="language-bash">{step_1}</code
	></pre>

<h3>2</h3>

<p>Follow the install prompts.</p>
<p>Choose your template (more coming soon)</p>

<h3>3</h3>

<button onclick={() => copy(step_2)}>Copy</button>
<pre class="shiki shiki-themes night-owl night-owl"><code class="language-bash">{step_2}</code
	></pre>

<h3>4</h3>

<button onclick={() => copy(step_3)}>Copy</button>
<pre class="shiki shiki-themes night-owl night-owl"><code class="language-bash">{step_3}</code
	></pre>

<h2>Aliases and Structure</h2>
<h3>Aliases</h3>
<p>
	These exist to make your life easier. Stop worrying about relative paths and moving files with
	smart defaults for additional aliases beyond the classic <code> $lib</code>.
</p>
<pre><code class="language-js"
		>$: 'src',
$settings: 'src/settings',
$routes: 'src/routes',
$state: 'src/state',
$types: 'src/types',
$utils: 'src/utilities'
</code></pre>
<p>This means if you want to access your global state or utils you just use</p>
<pre><code
		>import {'{your_state}'} from '$state/your_state.ts;
</code></pre>

<style>
	.active {
		border-color: blue;
	}
</style>
