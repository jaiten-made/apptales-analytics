# Session Management Documentation

## Overview

The AppTales API implements a sophisticated session management system for tracking user activity across web applications. This system follows Google Analytics-style session behavior with two key expiration mechanisms:

1. **Inactivity Timeout**: 30 minutes of no events
2. **Daily Reset**: Sessions expire at UTC midnight

## Architecture

### Components

- **Middleware**: `apps/api/src/routes/EventsRoute/middleware.ts`
- **JWT Utilities**: `apps/api/src/utils/session-jwt.ts`
- **Database Models**: Session, Event (Prisma)

## Session Lifecycle

### 1. Session Creation

A new session is created when:
- No session token exists in cookies
- The JWT token has expired (past UTC midnight)
- 30 minutes of inactivity has passed since the last event

```typescript
const createAndSetSessionCookie = async (res: Response, projectId: string) => {
  // Creates new session in database
  // Signs JWT token that expires at next UTC midnight
  // Sets httpOnly cookie with 30-minute maxAge
}
```

**Cookie Settings:**
- `httpOnly: true` - Prevents XSS attacks
- `secure: true` (production) - HTTPS only
- `sameSite: "strict"` - CSRF protection
- `maxAge: 30 * 60 * 1000` - 30 minutes

### 2. Session Validation Flow

The `checkSessionExpiry` middleware runs on every request to `/events`:

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Received                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Token exists? │
              └───────┬───────┘
                      │
         ┌────────────┴────────────┐
         │ NO                      │ YES
         ▼                         ▼
  ┌──────────────┐        ┌────────────────┐
  │ Create new   │        │ Decode token   │
  │ session      │        └────────┬───────┘
  └──────────────┘                 │
                                   ▼
                          ┌────────────────┐
                          │ Verify JWT     │
                          │ (not expired?) │
                          └────────┬───────┘
                                   │
                      ┌────────────┴────────────┐
                      │ EXPIRED                 │ VALID
                      ▼                         ▼
              ┌──────────────┐        ┌─────────────────┐
              │ Create new   │        │ Query last event│
              │ session      │        └────────┬────────┘
              └──────────────┘                 │
                                               ▼
                                    ┌──────────────────────┐
                                    │ Last event > 30 min? │
                                    └──────────┬───────────┘
                                               │
                                  ┌────────────┴────────────┐
                                  │ YES                     │ NO
                                  ▼                         ▼
                          ┌──────────────┐        ┌─────────────────┐
                          │ Create new   │        │ Use existing    │
                          │ session      │        │ session         │
                          └──────────────┘        └─────────────────┘
                                  │                         │
                                  └────────────┬────────────┘
                                               ▼
                                    ┌──────────────────────┐
                                    │ Set req.body.sessionId│
                                    └──────────┬────────────┘
                                               ▼
                                    ┌──────────────────────┐
                                    │    Continue (next()) │
                                    └──────────────────────┘
```

### 3. Inactivity Detection

The middleware queries the database for the most recent event:

```typescript
const lastEvent = await prisma.event.findFirst({
  where: { sessionId: sessionId },
  orderBy: { createdAt: "desc" },
});

if (lastEvent) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  if (lastEvent.createdAt < thirtyMinutesAgo) {
    // Create new session - user has been inactive
    sessionId = await createAndSetSessionCookie(res, decoded.projectId);
  }
}
```

## JWT Token Behavior

### Token Expiration

Tokens expire at **UTC midnight** to align with daily analytics boundaries:

```typescript
const getSecondsUntilMidnight = (): number => {
  const now = new Date();
  const nextUtcMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1, // next day
      0, 0, 0, 0
    )
  );
  return Math.floor((nextUtcMidnight.getTime() - now.getTime()) / 1000);
};
```

**Example Timeline:**

| Time (UTC) | Action | Token Expires At | Time Until Expiry |
|------------|--------|------------------|-------------------|
| 6:00 PM | User visits site | 12:00 AM (midnight) | 6 hours |
| 11:30 PM | User returns | 12:00 AM (midnight) | 30 minutes |
| 1:00 AM | User visits next day | 12:00 AM (next midnight) | 23 hours |

### Token Payload

```typescript
interface SessionPayload {
  sessionId: string;  // Database session ID
  projectId: string;  // Associated project
  iat: number;        // Issued at (added by JWT)
  exp: number;        // Expires at (added by JWT)
}
```

## Session Expiry Rules

A new session is created when **ANY** of these conditions are met:

1. ✅ **No token exists** - First-time visitor or cookies cleared
2. ✅ **JWT expired** - Past UTC midnight
3. ✅ **30 minutes of inactivity** - No events for 30+ minutes

## Use Cases & Examples

### Example 1: Active User Throughout the Day

```
09:00 AM - User visits site → Session A created
09:15 AM - Page view event → Session A continues
10:00 AM - Click event → Session A continues
...
11:59 PM - Last event → Session A continues
12:00 AM - JWT expires → Next event creates Session B
```

### Example 2: User Returns After Lunch

```
10:00 AM - User visits site → Session A created
10:30 AM - Last event before lunch
12:00 PM - User leaves for lunch (no events)
01:15 PM - User returns (45 min later) → Session B created (inactivity)
```

### Example 3: Multiple Short Visits

```
02:00 PM - User visits → Session A created
02:05 PM - User leaves
02:20 PM - User returns (15 min) → Session A continues
02:25 PM - User leaves
03:00 PM - User returns (35 min) → Session B created (inactivity)
```

## Database Queries

### Performance Considerations

The middleware performs **one database query per request**:

```sql
SELECT * FROM "Event"
WHERE "sessionId" = $1
ORDER BY "createdAt" DESC
LIMIT 1;
```

**Optimization Opportunities:**
- Add database index on `(sessionId, createdAt DESC)`
- Implement Redis caching for last event timestamps
- Use database triggers to maintain `last_event_at` on Session table

### Current Approach

The current implementation prioritizes **simplicity and correctness** over performance:
- ✅ Easy to understand and debug
- ✅ No caching complexity
- ✅ Always accurate
- ⚠️ One DB query per request

**Future optimization** with Redis can be added when needed without changing the API contract.

## Security Features

### Cookie Security

```typescript
res.cookie("sessionToken", token, {
  httpOnly: true,        // Prevents JavaScript access (XSS protection)
  secure: true,          // HTTPS only in production
  sameSite: "strict",    // CSRF protection
  maxAge: 30 * 60 * 1000 // 30 minutes
});
```

### JWT Security

- **Secret-based signing**: Uses `JWT_SECRET` environment variable
- **Expiration enforcement**: Tokens automatically expire at midnight
- **Payload validation**: Type-safe payload structure

## Error Handling

The middleware handles several error cases:

1. **Missing projectId**: Returns error if no token and no projectId in query
2. **Token expired**: Automatically creates new session
3. **Invalid token**: Passes error to Express error handler
4. **Database errors**: Caught and passed to error handler

## Integration

### Usage in Routes

```typescript
import { checkSessionExpiry } from "./middleware";

router.post("/", 
  checkSessionExpiry,  // Middleware runs first
  validateEventPayload,
  async (req, res) => {
    // req.body.sessionId is now available
    const event = await prisma.event.create({
      data: {
        sessionId: req.body.sessionId,
        // ... other fields
      }
    });
  }
);
```

### Request Flow

```
Client Request
    ↓
checkSessionExpiry middleware
    ↓ (sets req.body.sessionId)
validateEventPayload middleware
    ↓
Route handler (creates event)
    ↓
Response
```

## Comparison with Google Analytics

| Feature | AppTales | Google Analytics |
|---------|----------|------------------|
| Inactivity timeout | 30 minutes | 30 minutes (default) |
| Daily reset | UTC midnight | Configurable timezone |
| Session storage | Database + JWT | Client-side cookie |
| Max session duration | Until midnight | Configurable (default 30 min) |

## Future Enhancements

### Potential Optimizations

1. **Redis Caching**
   ```typescript
   // Cache last event timestamp in Redis
   const lastEventTime = await redis.get(`session:${sessionId}:lastEvent`);
   if (!lastEventTime) {
     // Fallback to database query
   }
   ```

2. **Database Denormalization**
   ```sql
   ALTER TABLE "Session" ADD COLUMN "lastEventAt" TIMESTAMP;
   -- Update via trigger on Event insert
   ```

3. **Configurable Timeouts**
   ```typescript
   const INACTIVITY_TIMEOUT = process.env.SESSION_TIMEOUT || 30 * 60 * 1000;
   ```

4. **Timezone Support**
   ```typescript
   // Allow per-project timezone configuration
   const midnight = getNextMidnight(project.timezone);
   ```

## Troubleshooting

### Sessions expiring too quickly

- Check if events are being created successfully
- Verify system time is correct (UTC)
- Check JWT_SECRET is consistent across deployments

### Sessions not expiring

- Verify database queries are returning correct timestamps
- Check if JWT expiration is being enforced
- Ensure cookie maxAge is set correctly

### Multiple sessions for same user

This is **expected behavior** when:
- User is inactive for 30+ minutes
- User visits after midnight UTC
- User clears cookies or uses incognito mode

## References

- [Google Analytics Session Documentation](https://support.google.com/analytics/answer/2731565)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Cookie Security](https://expressjs.com/en/advanced/best-practice-security.html)
