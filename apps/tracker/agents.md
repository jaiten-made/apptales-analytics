# AGENTS.md - Tracker (Cloudflare Workers)

For workspace-wide conventions and setup, see [docs/agents.md](../../docs/agents.md).

## Project Overview

Event tracking service deployed to Cloudflare Workers. Handles real-time analytics event ingestion and processing from client-side tracking code.

### Tech Stack

- **Runtime**: Cloudflare Workers (serverless edge compute)
- **Framework**: Cloudflare Workers API
- **Build Tool**: Vite (^7.1.6)
- **Worker Config**: Wrangler (^4.42.2) (wrangler.jsonc)
- **TypeScript**: Strict mode with Node.js config (~5.8.3)

## Dev Environment & Setup

### Start Local Development Server

```bash
pnpm -F @apptales/tracker dev
```

Starts Wrangler local dev server for testing.

### Build

```bash
pnpm -F @apptales/tracker build
```

Bundles code for Cloudflare Workers deployment.

### Deploy to Cloudflare

```bash
pnpm -F @apptales/tracker deploy
```

Deploys worker to Cloudflare production environment.

## Cloudflare Workers Fundamentals

### Worker Execution Model

- Runs on Cloudflare's edge network (globally distributed)
- Handles HTTP requests and responses
- Limited runtime: typical request completes in 30 seconds
- No persistent file system (use KV storage for state)

### Request Handler

Workers export a handler function:

```ts
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // Handle request
    return new Response("Hello");
  },
};
```

## Project Structure

```
src/
├── main.ts          - Worker request handler entry point
├── tracker.ts       - Tracking event processing logic
├── api.ts           - API endpoint handlers
├── types.ts         - TypeScript type definitions
├── utils.ts         - Utility functions
└── vite-env.d.ts    - Vite type definitions

test/
├── index.html       - Local testing page

wrangler.jsonc      - Cloudflare Worker configuration
```

## Wrangler Configuration

[wrangler.jsonc](./wrangler.jsonc) defines:

- Worker name and routes
- Environment variables
- KV bindings (key-value storage)
- Durable Objects (if used)
- Triggers and cron jobs

### Key Configuration Options

```jsonc
{
  "name": "apptales-tracker",
  "main": "src/main.ts",
  "compatibility_date": "2024-01-01",

  // Environment variables accessible via env parameter
  "env": {
    "production": {
      "vars": {
        "API_URL": "https://api.example.com",
      },
    },
  },

  // KV namespaces
  "kv_namespaces": [{ "binding": "CACHE", "id": "..." }],
}
```

Access in worker:

```ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const apiUrl = env.API_URL;
    const cache = env.CACHE;
    // ...
  },
};
```

## Event Tracking

### Tracking Event Format

```ts
interface TrackingEvent {
  eventId: string;
  eventName: string;
  timestamp: number;
  userId?: string;
  projectId: string;
  properties?: Record<string, any>;
  sessionId?: string;
}
```

### Processing Events

1. Receive event from client-side tracker
2. Validate event structure
3. Store or forward to backend API
4. Return response to client

### KV Storage (Caching)

```ts
// Store event in KV cache temporarily
await env.CACHE.put(
  `event:${eventId}`,
  JSON.stringify(event),
  { expirationTtl: 3600 }, // 1 hour
);

// Retrieve cached event
const cached = await env.CACHE.get(`event:${eventId}`);
```

## API Endpoints

### Typical Endpoints

- `POST /track` - Submit tracking event
- `GET /health` - Health check
- `POST /batch` - Batch event submission

### Handling Requests

```ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { method, url } = request;
    const pathname = new URL(url).pathname;

    if (pathname === "/track" && method === "POST") {
      return handleTrackEvent(request, env);
    }

    if (pathname === "/health" && method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
```

## Testing Locally

### Test Page

[test/index.html](./test/index.html) provides a local testing interface.

Run dev server:

```bash
pnpm -F @apptales/tracker dev
```

Visit http://localhost:8787/test to test tracking functionality.

### Sending Test Events

```ts
async function trackEvent(eventName: string, properties = {}) {
  const response = await fetch("http://localhost:8787/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: crypto.randomUUID(),
      eventName,
      timestamp: Date.now(),
      projectId: "test-project",
      properties,
    }),
  });

  return response.json();
}
```

## Performance Considerations

### Edge Latency

- Keep CPU-intensive operations minimal
- Offload complex processing to backend API
- Use KV cache strategically

### Response Size

- Minimize JSON response payload
- Compress data when possible
- Return only necessary information

### Timeout Management

- Default Worker timeout: 30 seconds
- Plan for network latency to backend API
- Implement timeout handling

Example with timeout:

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(apiUrl, {
    signal: controller.signal,
  });
  return response;
} catch (error) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return new Response("Timeout", { status: 504 });
  }
  throw error;
} finally {
  clearTimeout(timeoutId);
}
```

## CORS Handling

### Cross-Origin Requests

Tracking requests come from different domains. Set CORS headers:

```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    // Handle request...
  },
};
```

## Error Handling

### Graceful Degradation

```ts
try {
  const result = await processEvent(event, env);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
} catch (error) {
  console.error("Event processing error:", error);

  // Return safe error response
  return new Response(JSON.stringify({ error: "Processing failed" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
```

### Logging

- Logs visible in Cloudflare dashboard
- Use `console.log()`, `console.error()` for debugging
- Include relevant context in error messages

## Deployment

### Environment-Specific Configuration

```bash
# Deploy to production
pnpm -F @apptales/tracker deploy

# Deploy to staging
pnpm -F @apptales/tracker deploy --env staging
```

### Environment Variables in Production

Set via Wrangler dashboard or:

```bash
wrangler secret put API_KEY --env production
```

## Type Definitions

[src/types.ts](./src/types.ts) defines Worker environment and event types.

### Cloudflare Worker Environment Type

```ts
interface Env {
  // Environment variables
  API_URL: string;
  API_KEY: string;

  // KV namespaces
  CACHE: KVNamespace;

  // Durable Objects (if used)
  // COUNTER: DurableObjectNamespace;
}
```

## Building & Vite Configuration

[vite.config.ts](./vite.config.ts) handles:

- TypeScript compilation
- Module bundling for Workers
- Asset optimization

## Testing

### Unit Tests

```bash
pnpm -F @apptales/tracker test
```

### Testing Best Practices

- Mock Cloudflare Worker APIs
- Test timeout scenarios
- Test error handling
- Verify CORS headers

Example with mocking:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Tracker", () => {
  let env: Env;

  beforeEach(() => {
    env = {
      API_URL: "http://localhost:3000",
      CACHE: {
        put: vi.fn(),
        get: vi.fn(),
      } as unknown as KVNamespace,
    };
  });

  it("should track event", async () => {
    const event = {
      eventId: "123",
      eventName: "page_view",
      timestamp: Date.now(),
      projectId: "test",
    };

    const response = await handleTrackEvent(event, env);
    expect(response.status).toBe(200);
  });
});
```

## Monitoring & Debugging

### Cloudflare Dashboard

- View worker logs and errors
- Monitor request metrics
- Check CPU usage and KV operations

### Local Testing

```bash
pnpm -F @apptales/tracker dev
```

### Debugging in Local Dev

- Browser DevTools for test page
- Console output from worker
- Use request/response logging

## Security Considerations

### Input Validation

- Validate all event fields
- Check project ID authenticity
- Rate limiting if needed

### Secret Management

- Use `wrangler secret` for API keys
- Never hardcode secrets in code
- Restrict KV namespace access

### CORS & Origin Validation

- Only allow trusted origins
- Validate project ID matches origin
- Implement request signing if needed

## Common Tasks

### Add a New Event Type

1. Define in event schema/types
2. Add handler in tracker logic
3. Update validation
4. Test with local dev server
5. Deploy with `pnpm deploy`

### Modify Tracking Payload

1. Update event interface in [src/types.ts](./src/types.ts)
2. Update client SDK expectations
3. Test backward compatibility
4. Deploy and monitor

### Integrate with Backend API

1. Update API endpoint in [src/api.ts](./src/api.ts)
2. Add error handling and retries
3. Test timeout scenarios
4. Add logging for debugging

## Related Documentation

- Root conventions: [docs/agents.md](../../docs/agents.md)
- Wrangler config: [wrangler.jsonc](./wrangler.jsonc)
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- TypeScript config: [tsconfig.json](./tsconfig.json)
- Vite config: [vite.config.ts](./vite.config.ts)
