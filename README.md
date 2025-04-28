# Drop In 🛹

Drop-in to your new local first app. Get started in no time, your framework should do more for you.

## NOTE

This is a WIP. In the near future, the primary template will be local first via Zero. The most usable and available template is the

## Getting Started

1. `npx @drop-in/new your-app-name` || `pnpx @drop-in/new your-app-name`
2. `cd ./your-app-name`
3. `pnpm install` || `npm install`
4. Set ENV credentials
5. (optional). `npm run typegen` || `pnpm typegen` must have all env credentials set to work

## Templates

- Lofi -> The default template

### Features & Packages

- Easy start for local first, Zero based sites
- Base CSS @drop-in/graffiti
  - Basic typography system
  - Grid System
- Elements @drop-in/decks
  - Standards based simple toast system
  - Dialog based modals and drawers
  - Popover base menues
- Elements @drop-in/ramps
  - Customizable tmeplates that you can pull into your project
- Aliases and structure
- Drizzle based server schema / migrations with Zero Drizzle connection for a one time schema authoring experience.
- Auth via @drop-in/pass
- Email via @drop-in/beeper

### Included Aliases

```js
$lib: 'src/lib';
$routes: 'src/routes';
$state: 'src/state';
$types: 'src/types';
$utils: 'src/utilities';
```

### Commands

#### make-package

Usage: `npm run make-package`

Follow the wizard to create a new package. This will add a new package starter to the local packages folder /src/packages. This will also add "@org-name/your-package-name": "workspace:^", to your package.json file

#### types

Usage: `npm run types`

Generate types for pocketbase to be used throughout project. Requires all env vars to be correctly set.

### FAQ

#### What is Zero?

Zero Sync is the local first platform of your dreams. https://zero.rocicorp.dev/ utilizing Zero Svelte, Drop In is able to load data locally while syncing to your database in the backend.

#### Why no authenticated SSR?

The base template has two main route paths. SSR based with no auth or app code with auth. While you could have authenticated user data there are enough major differences in approach (ie not using server actions, cookie for auth token, .server.ts files, ect..) that having both in this codebase felt like it would make it too complex. Might make a 2nd template with full SSR.

#### Why no (insert styling library) included?

It's pretty trivial to add those yourself and I wanted to keep this as bare as possible style wise. Many projects have their own CSS needs and I want to respect that. I'd like to add a cli with alternate builds of this with more baked in UI if anyone is interested in helping.

### Inspirations

- Svelte Kit CLI code
- Meteor
