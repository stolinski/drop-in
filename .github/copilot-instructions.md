# Drop In 🛹 - Local First SvelteKit Framework

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup
- Install pnpm v10+ globally: `npm install -g pnpm@latest`
- Install dependencies: `pnpm install` -- takes 45 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Build packages: `pnpm package --filter="./packages/**" --filter="!@drop-in/docs"` -- takes 45 seconds. NEVER CANCEL. Set timeout to 120+ seconds.

### Development Commands
- Build documentation: `pnpm docs:build` -- takes 15 seconds. Set timeout to 30+ seconds.
- Start docs dev server: `pnpm docs:dev` (serves at http://localhost:4321)
- Start template development: `pnpm template:z:dev` 
- Start decks development: `pnpm decks:dev`

### Create New Applications
- Create new app: `node bin.js <app-name>` (interactive CLI)
- The CLI creates local-first SvelteKit apps with Zero sync, authentication, and database integration
- Generated apps require environment configuration before they can build successfully

### Requirements
- Node.js 20+ (checked via `node --version`)
- pnpm 10+ (install via `npm install -g pnpm@latest`)
- Docker (required for generated apps' database services)

## Validation

### Build Validation
- ALWAYS run `pnpm install` before making changes
- Build packages to verify no breaking changes: `pnpm package --filter="./packages/**" --filter="!@drop-in/docs"`
- Build documentation: `pnpm docs:build`
- NEVER CANCEL builds - they may take up to 2 minutes

### Generated App Validation
After creating a new app with the CLI:
1. `cd <app-name>`
2. `pnpm install` -- takes 45 seconds for first install
3. Set up environment variables in `.env` (copy from `example.env`)
4. Required env vars: `DATABASE_URL`, `JWT_SECRET`, `ZERO_JWT_SECRET`
5. Test development server: `pnpm run dev` (should start on localhost with random port)
6. Test type checking: `pnpm run check` (may show config-related errors in fresh apps)

### Linting and Formatting
- Individual packages have lint/format commands: `pnpm run lint`, `pnpm run format`
- Root project does not have centralized lint/format commands
- Example linting: `cd examples/zero-survey && pnpm run lint`

## Common Tasks

### Repository Structure
```
.
├── packages/          # Framework packages (beeper, decks, graffiti, pass, plugin, ramps, docs)
├── templates/         # App templates (z - Local First with Zero)
├── examples/          # Example applications (zero-survey)
├── bin.js            # CLI tool for generating new apps
├── package.json      # Root package with turbo scripts
└── turbo.json        # Build configuration
```

### Key Scripts (from package.json)
- `pnpm package` - Build all packages except docs
- `pnpm docs:dev` - Start documentation development server
- `pnpm docs:build` - Build documentation site  
- `pnpm template:z:dev` - Start template development
- `pnpm all:update` - Update all dependencies

### Generated App Structure
Generated apps include:
- Local-first sync via Zero (requires PostgreSQL)
- Authentication via @drop-in/pass
- Email sending via @drop-in/beeper  
- UI components via @drop-in/decks
- CSS framework via @drop-in/graffiti
- Database ORM via Drizzle
- Docker setup for development

### Timing Expectations
- `pnpm install`: ~45 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- `pnpm package`: ~45 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- `pnpm docs:build`: ~15 seconds. Set timeout to 30+ seconds.
- Generated app `pnpm install`: ~45 seconds. Set timeout to 120+ seconds.
- Dev server startup: ~2-3 seconds.

### Known Issues
- The docs package doesn't have a "package" script, exclude it from package builds
- Generated apps require full environment configuration to build successfully
- Some linting configurations have warnings but are functional
- Build processes may require database connections even during static builds

### Framework Packages
- `@drop-in/beeper` - Email sending
- `@drop-in/decks` - UI components and toast system
- `@drop-in/graffiti` - CSS framework with typography and grid
- `@drop-in/pass` - Authentication system
- `@drop-in/plugin` - Core plugin system
- `@drop-in/ramps` - Customizable component templates
- `@drop-in/docs` - Starlight-based documentation

Always build and exercise your changes using the validation steps above before considering your work complete.