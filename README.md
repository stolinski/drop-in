# SvelteKit / Svelte 5 / PocketBase Starter Kit

## About The Codebase

This is a CSR or Static starter kit for PocketBase. It uses the latest versions of Svelte and SvelteKit to quickly and easily get up and running with auth for a SvelteKit and Pocketbase site. Just BYO Pocketbase URL.

- Svelte 5
- Svelte Kit 2
- Pocketbase

## Getting Started

1. Clone Repo
2. cp example.env .env
3. Add ENV creds for type gen
4.

### Extras

- Auth with templates
- Type generation via pocketbase-typegen
- Auth guard function
- Aliases and folders

```
$: 'src',
$routes: 'src/routes',
$state: 'src/lib/state',
$types: 'src/types',
$utils: 'src/utilities',
```

syntax.fm

### FAQ

#### Why not SSR

I'll be making a 2nd starter for SSR specifically, however there are enough major differences in approach (ie not using server actions, cookie for auth token, .server.ts files, ect..) that having both in this codebase felt like it would make it too complex.

#### Why no Tailwind or base CSS?

It's pretty trivial to add those classes yourself, get TS configured in Svelte Kit. I wanted to keep this as bare as possible deps wise while also making it super functional. Many projects have their own CSS needs and I want to respect that.
