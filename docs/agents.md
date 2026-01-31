# AGENTS.md - AppTales Analytics Showcase

This document provides guidance for AI coding agents working on the AppTales Analytics Showcase monorepo.

## Workspace Overview

This is a **pnpm monorepo** with the following structure:

- **apps/** - Application projects (API, main app, landing, provisioning portal, tracker)
- **packages/** - Shared packages (TypeScript config, types, utilities, UI config)
- **docs/** - Documentation

Each subdirectory may have its own `AGENTS.md` file with project-specific guidance. Read the nearest `AGENTS.md` first.

## Dev Environment Setup

### Prerequisites

- Node.js (check `.nvmrc` or `package.json` engines field)
- pnpm (v8+)

### Installation

```bash
pnpm install
```

### Workspace Navigation

```bash
# List all packages and apps
pnpm list --depth=0

# Install dependencies in a specific package
pnpm install --filter <package-name>

# Add a dependency to a specific package
pnpm add <package-name> --filter <target-package>

# Run scripts across workspace
pnpm turbo run <script-name>

# Run scripts in specific package
pnpm -F <package-name> run <script-name>
```

## TypeScript Configuration

### Config Hierarchy

- **packages/typescript-config/base.json** - Base strict TypeScript settings
- **packages/typescript-config/react.json** - React-specific extends base.json
- **packages/typescript-config/node.json** - Node.js backend extends base.json
- Individual `tsconfig.json` files extend appropriate config from packages/typescript-config

### Strict Mode

All projects use TypeScript strict mode. Key requirements:

- Explicit type annotations for function parameters and return types
- No implicit `any` types
- Strict null checks enabled

### Code Style - TypeScript

- **Quotes**: Double quotes for strings
- **Semicolons**: Required at statement ends
- **Naming**: camelCase for variables/functions, PascalCase for classes/types/interfaces
- **Imports**: Use ESM syntax (`import`/`export`)
- **Unused code**: Remove or suppress intentionally
- **Line length**: Aim for 100 characters max (not strict)

### File & Folder Naming Conventions

- **Folders**: lowercase with hyphens for multi-word names (e.g., `auth-handlers`, `data-processing`)
- **File suffixes** by purpose:
  - Utilities: `clipboard.util.ts`, `date-formatter.util.ts`
  - Services: `email.service.ts`, `payment.service.ts`
  - Controllers: `user.controller.ts`, `project.controller.ts`
  - Routers: `auth.router.ts`, `magic-link.router.ts`
  - Middleware: `auth.middleware.ts`, `rate-limit.middleware.ts`
  - Components: `PascalCase.tsx` (e.g., `UserCard.tsx`, `FormInput.tsx`)
  - Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`, `useFetch.ts`)
- **Multi-word names in files**: Use hyphens before the suffix (e.g., `magic-link.util.ts`, `oauth-provider.service.ts`)

### File Organization

```
src/
├── components/       (React components only)
├── controllers/      (API route handlers)
├── services/         (Business logic, external service integration)
├── utils/            (Utility functions)
├── types/            (Type definitions - prefer inline when possible)
├── middleware/       (Express middleware)
├── db/               (Database schema, relations, queries)
└── errors/           (Custom error classes)
```

## Build and Scripts

### Common Commands

```bash
# Development build/watch mode
pnpm dev

# Production build
pnpm build

# Linting
pnpm lint

# Type checking
pnpm type-check

# Testing
pnpm test

# Format code
pnpm format
```

### Turbo Pipelines

Key workspace scripts that run through Turbo:

- `dev` - Start dev servers/watchers
- `build` - Production builds
- `test` - Run test suites
- `lint` - Run linters

## Testing Instructions

### Test Framework & Patterns

- Use **Vitest** for unit tests (React components, utilities)
- Use **Jest** for integration tests where configured
- Use **Playwright** for E2E tests (if applicable)

### Running Tests

```bash
# Run tests in current package
pnpm test

# Run tests for specific package
pnpm -F <package-name> test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test -- <test-file-pattern>

# Coverage report
pnpm test -- --coverage
```

### Testing Conventions

- Test files: `*.test.ts` or `*.spec.ts`
- Mock external services in unit tests
- Keep test names descriptive: `should <action> when <condition>`
- Test behavior, not implementation details

## Code Style & Conventions

### Linting

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting (if configured)

Run linting:

```bash
pnpm lint
pnpm lint --fix  # Auto-fix issues
```

### Git Conventions

- **Branch naming**: `feature/name`, `fix/name`, `docs/name`
- **Commit messages**: Use conventional commits: `type(scope): message`
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
  - Example: `feat(api): add user authentication endpoint`
- **PR titles**: Match commit message format

## Security Considerations

### Sensitive Areas

- **Database credentials**: Never commit `.env` files; use environment variables
- **API keys**: Keep in environment variables or secure config
- **Auth middleware**: Check [apps/api/src/middleware/auth.ts](../../apps/api/src/middleware/auth.ts) for authentication logic

### Pre-commit Checks

- Run `pnpm lint` and `pnpm type-check` before committing
- Verify no secrets are committed: check `.env`, `.env.local` in `.gitignore`

## Database & ORM

### Using Drizzle ORM (API project)

- Schema definitions: [apps/api/src/db/schema.ts](../../apps/api/src/db/schema.ts)
- Relations: [apps/api/src/db/relations.ts](../../apps/api/src/db/relations.ts)
- Migrations: [apps/api/drizzle/](../../apps/api/drizzle/)

### Running Migrations

```bash
# Generate migration from schema changes
pnpm -F @apptales/api drizzle-kit generate:pg

# Apply migrations
pnpm -F @apptales/api drizzle-kit migrate:pg

# Studio UI for database inspection
pnpm -F @apptales/api drizzle-kit studio
```

## Shared Packages

### Internal Packages (use when appropriate)

- **@apptales/types** - Shared TypeScript types and schemas
- **@apptales/utils** - Shared utility functions
- **@apptales/mui-config** - Material-UI theme and configuration
- **@apptales/typescript-config** - TypeScript configuration base

### Installing from Shared Packages

```bash
pnpm add @apptales/types --filter @apptales/api
```

## Common Patterns & Gotchas

### Monorepo Navigation

- Always use package name from `package.json` `"name"` field (not folder name)
- Check root `pnpm-workspace.yaml` to see which directories are part of workspace

### TypeScript

- Avoid circular imports between packages; use clear dependency graph
- Import types with `import type` for cleaner bundles

### When Moving/Renaming Files

- Run `pnpm lint --fix` to update imports
- Check type-checking: `pnpm type-check`
- Re-run tests: `pnpm test`

## Project-Specific Guidance

Each app has its own AGENTS.md with tech-stack details:

- [apps/api/agents.md](../../apps/api/agents.md) - Backend API specifics
- [apps/app/agents.md](../../apps/app/agents.md) - React frontend
- [apps/landing/agents.md](../../apps/landing/agents.md) - Astro static site
- [apps/provisioning-portal/agents.md](../../apps/provisioning-portal/agents.md) - Provisioning UI
- [apps/tracker/agents.md](../../apps/tracker/agents.md) - Cloudflare Workers tracker

## Additional Resources

- Root README: [README.md](../../README.md)
- pnpm docs: https://pnpm.io/
- TypeScript docs: https://www.typescriptlang.org/
