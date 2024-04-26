# Sickit - SvelteKit / Svelte 5 / PocketBase Starter Kit

## About The Codebase

This is a bare starter kit for PocketBase / Svelte 5 / SvelteKit with lots of extras.

## Getting Started

1. `npx sickit your_app_name`
2. `cd ./your_app_name`
3. `npm install` `pnpm install` `yarn install`
4. Set ENV credentials
   5 (optional). `npm run typegen` must have all env credentials set to work

### Extras

- Auth with templates
- Type generation via pocketbase-typegen
- Auth guard function
- Aliases and folders
- App guard to redirect to app when logged in

```
$: 'src'
$settings: 'src/settings'
$routes: 'src/routes'
$state: 'src/lib/state'
$types: 'src/types'
$utils: 'src/utilities'
```

syntax.fm

### FAQ

#### Why not SSR

I'll be making a 2nd starter for SSR specifically, however there are enough major differences in approach (ie not using server actions, cookie for auth token, .server.ts files, ect..) that having both in this codebase felt like it would make it too complex.

#### Why no Tailwind or base CSS?

It's pretty trivial to add those classes yourself, get TS configured in Svelte Kit. I wanted to keep this as bare as possible deps wise while also making it super functional. Many projects have their own CSS needs and I want to respect that. I'd like to add a cli with alternate builds of this with more baked in UI if anyone is interested in helping.

### Special Thanks

CLI code borrowed from Svelte Kit
