# $state

Store global state here and you can access it via `import { create_store } from $state/store.svelte'`

See implementation in ./app.svelte.ts for more information.

This is useful anytime you have state that isn't tightly scoped to one specific route or component.

Do not use for SSR because your state may be insecure.
