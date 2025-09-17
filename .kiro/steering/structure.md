# Project Structure & Organization

## Monorepo Layout

```
├── packages/           # Reusable Drop In packages
├── templates/          # Project templates
├── examples/           # Example applications
├── bin.js             # CLI entry point
└── turbo.json         # Monorepo build configuration
```

## Package Structure (`packages/`)

- **@drop-in/pass** - Authentication system with JWT, cookies, email verification
- **@drop-in/decks** - UI component library (dialogs, drawers, toasts, menus)
- **@drop-in/graffiti** - CSS framework with typography and grid system
- **@drop-in/ramps** - Customizable templates and components
- **@drop-in/beeper** - Email functionality
- **@drop-in/plugin** - Core plugin system

## Template Structure (`templates/z/`)

Standard SvelteKit application with Drop In conventions:

```
src/
├── lib/                # Shared utilities and components
├── routes/             # SvelteKit routes
├── state/              # Application state management
├── utils/              # Utility functions
├── app.d.ts           # TypeScript app definitions
├── app.html           # HTML template
├── hooks.server.ts    # Server-side hooks
├── schema.ts          # Zero/Drizzle schema
└── db_schema.ts       # Database schema definitions
```

## Standard Aliases

All templates include these path aliases:

```typescript
$lib: 'src/lib';
$routes: 'src/routes';
$state: 'src/state';
$types: 'src/types';
$utils: 'src/utilities';
```

## Configuration Files

- **drizzle.config.ts** - Database migration configuration
- **drop-in.config.js** - Drop In specific settings
- **zero-schema.json** - Zero Sync schema definition
- **docker/docker-compose.yml** - PostgreSQL development setup

## Naming Conventions

- **Packages**: Kebab-case with @drop-in/ namespace
- **Components**: PascalCase (.svelte files)
- **Files**: Kebab-case for configs, snake_case for schemas
- **Directories**: Lowercase, descriptive names

## Development Patterns

- **Local-first**: All data operations go through Zero Sync
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Library**: Reusable components in @drop-in/decks
- **State Management**: Svelte 5 runes in dedicated state/ directory
- **Authentication**: JWT-based with @drop-in/pass integration
- **Database**: Drizzle schema shared between server and Zero Sync
