# AGENTS.md - Main App

For workspace-wide conventions and setup, see [docs/agents.md](../../docs/agents.md).

## Project Overview

Main React application built with Vite and TypeScript. Provides the primary UI for analytics dashboard and user interactions.

### Tech Stack

- **Runtime**: Browser/Node.js (Vite dev server)
- **Framework**: React (19) with TypeScript
- **Build Tool**: Vite (7)
- **Styling**: CSS Modules or custom CSS [global.css](./src/global.css)
- **UI Library**: Material-UI (7) (via @apptales/mui-config)
- **TypeScript**: Strict mode with React config (5)

## Dev Environment & Setup

### Start Development Server

```bash
pnpm -F @apptales/app dev
```

Opens dev server (typically http://localhost:5173).

### Build

```bash
pnpm -F @apptales/app build
```

Creates optimized production build in `dist/` folder.

### Type Checking

```bash
pnpm -F @apptales/app type-check
```

## Project Structure

```
src/
├── main.tsx          - React app entry point
├── global.css        - Global styles
├── vite-env.d.ts     - Vite type definitions
├── app/              - App-level components and pages
├── assets/           - Static assets (images, fonts, etc.)
└── lib/              - Utility functions and helpers
```

## React Patterns & Conventions

### Component Structure

- **Functional components** only (hooks-based)
- Components in `src/app/components/` or feature-specific folders
- One component per file (unless very closely related)
- Use descriptive PascalCase names: `DashboardCard.tsx`, `UserProfile.tsx`

### Naming Conventions

- Components: PascalCase (`MyComponent.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`, `useFetch.ts`)
- Utilities: camelCase (`formatDate.ts`, `parseResponse.ts`)
- Constants: UPPER_SNAKE_CASE
- CSS Modules: `ComponentName.module.css`

### Props & Types

```tsx
// Always type props explicitly
interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export function Button({ onClick, label, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### State Management

- Use React hooks (`useState`, `useReducer`, `useContext`) as default
- Lift state up when needed between components
- Use custom hooks to encapsulate complex state logic
- For global state, consider Context API or external library

### Hooks Best Practices

```tsx
// ✅ Good: Clear dependencies
useEffect(() => {
  loadData();
}, [userId, projectId]); // Include all dependencies

// ✅ Good: Custom hooks for reusable logic
const { data, loading, error } = useFetchData(url);

// ❌ Avoid: Missing dependencies
useEffect(() => {
  loadData(userId);
}, []); // userId is missing!
```

## Styling

### CSS Approach

- Use the styling method configured (likely CSS Modules or inline styles)
- Global styles in [src/global.css](./src/global.css)
- Component-scoped styles in `ComponentName.module.css`
- Use theme from `@apptales/mui-config` for consistency

### Theme Colors & Spacing

- Import theme from `@apptales/mui-config`
- Use theme values for colors, spacing, breakpoints
- Avoid hardcoded colors and sizes

## Testing

### Run Tests

```bash
pnpm -F @apptales/app test
```

### Testing React Components

- Use Vitest + React Testing Library
- Test user behavior, not implementation
- Mock API calls and external dependencies

Example:

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

it("should call onClick when clicked", () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick} label="Click me" />);

  screen.getByRole("button", { name: /click me/i }).click();
  expect(onClick).toHaveBeenCalled();
});
```

## API Integration

### Fetching Data

- Centralize API calls in custom hooks or services
- Use [src/lib/](./src/lib/) for API utilities
- Handle loading and error states consistently

Example:

```tsx
function useFetchProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
}
```

### Environment Variables

- Create `.env.local` for local development (not committed)
- Use `VITE_` prefix for variables that should be exposed to browser

Example `.env.local`:

```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=AppTales Analytics
```

Access in code:

```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

## Vite Configuration

- Config file: [vite.config.ts](./vite.config.ts)
- Plugins and optimization settings
- Asset handling and code splitting

## Building & Deployment

### Production Build

```bash
pnpm -F @apptales/app build
```

Creates optimized bundle in `dist/` folder.

### Preview Production Build Locally

```bash
pnpm -F @apptales/app preview
```

## Performance Optimization

### Code Splitting

- Use dynamic imports for route-based splitting:

```tsx
const Dashboard = lazy(() => import("./Dashboard"));
```

### Bundle Analysis

- Run build and check output sizes
- Remove unused dependencies
- Lazy-load heavy components

### Memoization

```tsx
import { memo } from "react";

const ExpensiveComponent = memo(({ data }: Props) => {
  // Component only re-renders if data prop changes
  return <div>{data}</div>;
});
```

## Common Tasks

### Add a New Page

1. Create component in [src/app/pages/](./src/app/pages/) (or similar)
2. Add route in app router configuration
3. Create tests for the page
4. Add global styles if needed to [src/global.css](./src/global.css)

### Fetch Data from API

1. Create custom hook in [src/lib/hooks/](./src/lib/hooks/)
2. Use in component with proper error/loading handling
3. Test hook with mocked API responses

### Add Theme Customization

1. Update theme in `@apptales/mui-config`
2. Re-import in app and verify styling
3. Update any hardcoded colors to use theme

## Debugging

### Browser DevTools

- React Developer Tools browser extension
- Network tab for API requests
- Console for errors and logs

### Vite Debug Mode

```bash
DEBUG=* pnpm -F @apptales/app dev
```

## Code Style

- Follow TypeScript strict mode
- Use descriptive variable names
- Keep components small and focused
- Write components that are easy to test
- Document complex logic with comments

## Related Documentation

- Root conventions: [docs/agents.md](../../docs/agents.md)
- TypeScript config: [tsconfig.json](./tsconfig.json)
- Vite config: [vite.config.ts](./vite.config.ts)
- MUI Theme: [@apptales/mui-config](../../packages/mui-config)
