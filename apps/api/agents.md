# AGENTS.md - API Server

For workspace-wide conventions and setup, see [docs/agents.md](../../docs/agents.md).

## Project Overview

Backend API server built with Express and Drizzle ORM. Provides event tracking, project management, session handling, and provisioning endpoints.

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (4)
- **Database**: PostgreSQL with Drizzle ORM (0.45)
- **API Testing**: Bruno (API client in `bruno/` folder)
- **TypeScript**: Strict mode with Node.js config (5)

## Dev Environment & Setup

### Start Development Server

```bash
pnpm -F @apptales/api dev
```

Starts server in watch mode (uses tsx or similar for hot reload).

### Build

```bash
pnpm -F @apptales/api build
```

Uses `tsup` config [tsup.config.ts](./tsup.config.ts) for optimization.

## Database

### Drizzle ORM Setup

- **Schema**: [src/db/schema.ts](./src/db/schema.ts) - Table definitions
- **Relations**: [src/db/relations.ts](./src/db/relations.ts) - Relationships between tables
- **Config**: [drizzle.config.ts](./drizzle.config.ts)

### Running Migrations

```bash
# Generate new migration from schema changes
pnpm -F @apptales/api drizzle-kit generate:pg

# Apply pending migrations to database
pnpm -F @apptales/api drizzle-kit migrate:pg

# View database in UI
pnpm -F @apptales/api drizzle-kit studio
```

### Seeding Database

```bash
# Run seed script
pnpm -F @apptales/api run seed
```

Uses [src/db/seed.ts](./src/db/seed.ts) to populate initial data.

## Code Organization

```
src/
├── server.ts           - Express app setup, middleware registration
├── controllers/        - Route handler logic (e.g., provisioning.controller.ts)
├── services/           - Business logic, external integrations
├── middleware/         - Express middleware (auth, CORS, project context, etc.)
├── routes/             - Route definitions and endpoint setup
├── db/                 - Database schema, relations, queries, seeding
├── errors/             - Custom error classes (HttpError.ts)
└── utils/              - Helper functions
```

## API Architecture

### Middleware Order

Check [src/server.ts](./src/server.ts) for middleware registration. Common middleware includes:

- CORS [src/middleware/cors.ts](./src/middleware/cors.ts)
- Authentication [src/middleware/auth.ts](./src/middleware/auth.ts)
- Admin secret check [src/middleware/adminSecret.ts](./src/middleware/adminSecret.ts)
- Project context [src/middleware/project.ts](./src/middleware/project.ts)

### Error Handling

- Use custom `HttpError` class from [src/errors/HttpError.ts](./src/errors/HttpError.ts)
- Always include proper HTTP status codes and error messages
- Return `{ error: string, message?: string }` JSON format

### Authentication

- Check [src/middleware/auth.ts](./src/middleware/auth.ts) for auth logic
- Typically header-based (Bearer token or similar)
- Protected routes should use `auth` middleware

## API Testing with Bruno

API collection and requests are in [bruno/](./bruno/) folder:

- [bruno/collection.bru](./bruno/collection.bru) - Collection config
- [bruno/API/](./bruno/API/) - Endpoint groups (Auth, Events, Projects, etc.)
- [bruno/environments/](./bruno/environments/) - Environment configs (dev, staging, prod)

### Adding New Endpoints to Bruno

1. Create `.bru` file in appropriate folder under `bruno/API/`
2. Define request method, URL, headers, body
3. Test against local/staging server

## Testing

### Run Tests

```bash
pnpm -F @apptales/api test
```

### Test Structure

- Unit tests for services and utilities
- Integration tests for route handlers
- Mock database queries where appropriate

## Building & Deployment

### Production Build

```bash
pnpm -F @apptales/api build
```

Output configured in `tsup.config.ts` (typically `dist/` folder).

### Environment Variables

Create `.env.local` (not committed) with:

- Database connection string
- API keys for external services
- Admin secret
- CORS allowed origins

Example:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/apptales
ADMIN_SECRET=your-secret-here
```

## Common Tasks

### Add a New Route

1. Create controller in [src/controllers/](./src/controllers/)
2. Define route in [src/routes/](./src/routes/)
3. Register route in [src/server.ts](./src/server.ts)
4. Add endpoint to Bruno for testing
5. Write tests in test files

### Modify Database Schema

1. Update [src/db/schema.ts](./src/db/schema.ts)
2. Run `drizzle-kit generate:pg` to create migration
3. Review generated migration in [drizzle/](./drizzle/)
4. Run `drizzle-kit migrate:pg` to apply
5. Update relations if needed in [src/db/relations.ts](./src/db/relations.ts)
6. Update seed script if adding new tables

### Add a Service

1. Create file in [src/services/](./src/services/)
2. Export functions or class with business logic
3. Import in controllers and use
4. Write unit tests

## Code Style

- Follow TypeScript strict mode
- Use descriptive variable names
- Export types alongside implementations
- Use async/await, avoid callbacks
- Handle errors explicitly (try/catch or .catch())

## Security Notes

- **API Keys**: Store in environment variables, never hardcode
- **Database**: Use parameterized queries (Drizzle handles this)
- **CORS**: Configure in [src/middleware/cors.ts](./src/middleware/cors.ts)
- **Auth**: Validate tokens, check permissions on protected routes
- **Input validation**: Validate request bodies, query params, and path params

## Debugging

### Enable Debug Logging

Set environment variables:

```bash
DEBUG=* pnpm -F @apptales/api dev
```

### Database Inspection

```bash
pnpm -F @apptales/api drizzle-kit studio
```

Opens Drizzle Studio UI for viewing/editing database records.

## Related Documentation

- Root conventions: [docs/agents.md](../../docs/agents.md)
- Database schema: [src/db/schema.ts](./src/db/schema.ts)
- TypeScript config: [tsconfig.json](./tsconfig.json)
