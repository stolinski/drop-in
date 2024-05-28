# Aliases and Structure

## Aliases

These exist to make your life easier. Stop worrying about relative paths and moving files with smart defaults for additional aliases beyond the classic ` $lib`.

```js
$: 'src',
$settings: 'src/settings',
$routes: 'src/routes',
$state: 'src/state',
$types: 'src/types',
$utils: 'src/utilities'
```

This means if you want to access your global state or utils you just use

```
import { your_state } from '$state/your_state.ts;
```

## Structure

Drop In has an opinionated but smart structure. This allows you to have a place to put everything as well as defaults for things like auth, header, footer, ect.

```
└── src/
    ├── settings.ts ($settings)
    ├── lib ($lib)
    ├── packages/
    │   └── @your-org/
    │       └── your-local-packages
    ├── routes ($routes)/
    │   ├── +layout.svelte (outtermost layout)
    │   ├── (app) - (csr'd for authenticated pages)/
    │   │   └── +layout.svelte
    │   └── (site) - (ssr'd for landing pages)/
    │       ├── +layout.svelte
    │       └── auth/
    │           └── ...all auth templates
    ├── state ($state)/
    │   └── your-global-state.ts
    └── types ($types)/
        └── pocketbase.ts (generated via types script)
```
