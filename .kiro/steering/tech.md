# Technology Stack & Build System

## Core Technologies

- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript
- **Package Manager**: pnpm (required, version 9.0.0+)
- **Build System**: Turbo (monorepo orchestration) + Vite
- **Node Version**: >20.11.1

## Key Dependencies

- **Zero Sync**: `@rocicorp/zero` + `zero-svelte` for local-first data
- **Database**: PostgreSQL with Drizzle ORM + `drizzle-zero`
- **Authentication**: Custom JWT-based system (@drop-in/pass)
- **Email**: @drop-in/beeper
- **UI Components**: @drop-in/decks (Svelte components)
- **Styling**: @drop-in/graffiti (CSS framework)

## Development Environment

- **Database**: Docker Compose with PostgreSQL
- **Zero Cache**: Local development server for Zero Sync
- **Hot Reload**: Vite dev server

## Common Commands

### Project Setup

```bash
npx @drop-in/new your-app-name
cd your-app-name
pnpm install
```

### Development (Monorepo Root)

```bash
pnpm dev                    # Start all development servers
pnpm package               # Build all packages
pnpm clean                 # Clean all build artifacts
```

### Template/App Development

```bash
pnpm start                 # Start app + zero-cache + database
pnpm dev                   # Start Vite dev server only
pnpm dev:zero-cache        # Start Zero cache server
pnpm dev:db-up            # Start PostgreSQL via Docker
pnpm dev:db-down          # Stop PostgreSQL
```

### Database & Schema

```bash
pnpm schema:generate       # Generate Drizzle schema for Zero
drizzle-kit generate       # Generate migrations
drizzle-kit migrate        # Run migrations
```

### Code Quality

```bash
pnpm check                 # TypeScript + Svelte check
pnpm lint                  # ESLint + Prettier check
pnpm format               # Format code with Prettier
```

## Build Configuration

- **Turbo**: Handles monorepo task orchestration and caching
- **Vite**: Primary build tool for applications
- **SvelteKit**: Framework-level build and packaging
- **TypeScript**: Strict mode enabled across all packages
