# AGENTS.md - Provisioning Portal

For workspace-wide conventions and setup, see [docs/agents.md](../../docs/agents.md).

## Project Overview

React application for customer provisioning workflows. Manages account setup, configuration, and onboarding processes for AppTales Analytics customers.

### Tech Stack

- **Runtime**: Browser/Node.js (Vite dev server)
- **Framework**: React (^19.1.1) with TypeScript
- **Build Tool**: Vite (^7.1.6)
- **Styling**: Custom CSS ([global.css](./src/global.css))
- **UI Library**: Material-UI (^7.3.2)
- **TypeScript**: Strict mode with React config (~5.8.3)

## Dev Environment & Setup

### Start Development Server

```bash
pnpm -F @apptales/provisioning-portal dev
```

Opens dev server (typically http://localhost:5174).

### Build

```bash
pnpm -F @apptales/provisioning-portal build
```

Creates optimized production build in `dist/` folder.

### Type Checking

```bash
pnpm -F @apptales/provisioning-portal type-check
```

## Project Structure

```
src/
├── App.tsx             - Root component and routing
├── main.tsx            - React app entry point
├── global.css          - Global styles
├── constants.ts        - Global constants and configuration
├── vite-env.d.ts       - Vite type definitions
└── utils/              - Utility functions and helpers
```

## React Patterns & Conventions

### Component Structure

- **Functional components** only (hooks-based)
- One component per file
- Use descriptive PascalCase names
- Keep components focused and reusable

### Props & Types

```tsx
interface ProvisioningFormProps {
  onSubmit: (data: ProvisioningData) => Promise<void>;
  initialValues?: ProvisioningData;
  isLoading?: boolean;
}

export function ProvisioningForm({
  onSubmit,
  initialValues,
  isLoading = false,
}: ProvisioningFormProps) {
  // Component implementation
}
```

### State Management

- Use React hooks (`useState`, `useReducer`, `useContext`)
- Custom hooks for complex logic
- Lift state when needed for shared access

## Provisioning-Specific Patterns

### Configuration & Constants

- Global constants in [src/constants.ts](./src/constants.ts)
- Feature flags, API endpoints, default values
- Reference this file for configuration

### Form Handling

- Create form components for different provisioning steps
- Handle validation before submission
- Show loading and error states to user
- Clear feedback on success/failure

### API Integration

- Centralize provisioning API calls
- Handle session and authentication
- Provide meaningful error messages to users

Example:

```tsx
async function provisionAccount(data: ProvisioningData) {
  try {
    const response = await fetch("/api/provisioning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Provisioning failed");
    }

    return response.json();
  } catch (error) {
    console.error("Provisioning error:", error);
    throw error;
  }
}
```

## Styling

### Global Styles

- Global styles in [src/global.css](./src/global.css)
- Component-scoped styles inline or in CSS modules
- Use consistent spacing and colors

### Theme Consistency

- Align with main app theme when possible
- Use theme colors from `@apptales/mui-config` if applied
- Ensure accessibility (contrast, readable text)

## Environment Variables

### Configuration

- Create `.env.local` for local development (not committed)
- Use `VITE_` prefix for browser-exposed variables

Example `.env.local`:

```
VITE_API_URL=http://localhost:3000
VITE_PROVISIONING_TIMEOUT=30000
```

Access in code:

```tsx
const apiUrl = import.meta.env.VITE_API_URL;
const timeout = parseInt(
  import.meta.env.VITE_PROVISIONING_TIMEOUT || "30000",
  10,
);
```

## Testing

### Run Tests

```bash
pnpm -F @apptales/provisioning-portal test
```

### Testing Provisioning Flows

- Mock API responses
- Test form validation
- Test success and error scenarios
- Verify user feedback messages

Example:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProvisioningForm } from "./ProvisioningForm";

it("should submit provisioning data on form submit", async () => {
  const onSubmit = vi.fn().mockResolvedValue({});
  const { user } = render(<ProvisioningForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "test@example.com");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

## Building & Deployment

### Production Build

```bash
pnpm -F @apptales/provisioning-portal build
```

Output in `dist/` folder.

### Preview Production Build

```bash
pnpm -F @apptales/provisioning-portal preview
```

## Vite Configuration

- Config file: [vite.config.ts](./vite.config.ts)
- Build optimization and asset handling

## User Experience

### Loading States

- Show loading indicator during provisioning
- Disable form submission while processing
- Provide feedback to user about progress

### Error Handling

- Display clear error messages
- Suggest recovery actions
- Log errors for debugging

### Success Confirmation

- Confirm successful provisioning
- Provide next steps or information
- Allow retry or editing if needed

## Accessibility

- Use semantic HTML
- ARIA labels for form controls
- Keyboard navigation support
- Color contrast compliance
- Test with screen readers

## Common Tasks

### Add a Provisioning Step

1. Create component for the step
2. Add to workflow in [src/App.tsx](./src/App.tsx)
3. Handle form submission and API call
4. Add error handling and user feedback
5. Test the entire flow

### Modify Form Fields

1. Update form component
2. Update type definitions for submitted data
3. Update API endpoint expectations
4. Test validation and submission

### Update Constants

1. Edit [src/constants.ts](./src/constants.ts)
2. Re-export where needed
3. Update types if structure changes
4. Update tests using these constants

## Code Style

- Follow TypeScript strict mode
- Use descriptive variable names
- Handle all promise rejections
- Test error scenarios
- Keep components focused on single responsibility

## Debugging

### Browser DevTools

- React Developer Tools extension
- Network tab for API requests
- Console for errors

### Vite Debug

```bash
DEBUG=* pnpm -F @apptales/provisioning-portal dev
```

## Related Documentation

- Root conventions: [docs/agents.md](../../docs/agents.md)
- Main app patterns: [apps/app/agents.md](../app/agents.md)
- TypeScript config: [tsconfig.json](./tsconfig.json)
- Vite config: [vite.config.ts](./vite.config.ts)
- Constants: [src/constants.ts](./src/constants.ts)
