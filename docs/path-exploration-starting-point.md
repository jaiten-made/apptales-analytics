# Path Exploration Starting Point Feature

## Overview

This feature allows users to filter path exploration by selecting a specific starting event. Instead of viewing all user paths from the beginning, users can now analyze paths that begin with a specific event of interest.

## Implementation

### Backend Changes

#### 1. Updated Path Exploration Endpoint

**File:** `apps/api/src/routes/ProjectRoute/router.ts`

**Changes:**

- Added optional `startingEventKey` query parameter to `/projects/:projectId/path-exploration`
- Updated SQL query to filter sessions that contain the starting event
- Re-numbers steps starting from the selected event's first occurrence
- Maintains backward compatibility - works with or without the filter

**API Usage:**

```
GET /projects/:projectId/path-exploration?startingEventKey=click:signup_button
```

**Response Format:** (unchanged)

```json
[
  {
    "step": 1,
    "event": {
      "key": "click:signup_button",
      "type": "click",
      "name": "signup_button"
    },
    "count": 150,
    "exits": 10
  },
  ...
]
```

#### 2. New Event Identities Endpoint

**File:** `apps/api/src/routes/ProjectRoute/router.ts`

**Purpose:** Provides a list of all unique events in a project for the filter dropdown

**Endpoint:**

```
GET /projects/:projectId/event-identities
```

**Response:**

```json
[
  {
    "id": "clx1234...",
    "key": "click:signup_button",
    "type": "click",
    "name": "signup_button",
    "eventCount": 1250
  },
  ...
]
```

**Features:**

- Returns events sorted by frequency (most common first)
- Includes event count for each identity
- Parses event keys into type and name components

### Frontend Changes

#### 1. Updated API Client

**File:** `apps/app/src/lib/redux/api/projects/project/project.ts`

**Changes:**

- Updated `getPathExploration` query to accept `{ projectId, startingEventKey? }`
- Added `getEventIdentities` query for fetching available events
- Exported new `useGetEventIdentitiesQuery` hook
- Added `EventIdentity` TypeScript interface

#### 2. New StartingPointSelector Component

**File:** `apps/app/src/app/features/journeys/components/FlowGraph/StartingPointSelector.tsx`

**Features:**

- Autocomplete dropdown with searchable event list
- Shows event type, name, and frequency
- Visual chip showing active filter
- "Clear Filter" button for easy reset
- Loading state during event fetch
- Keyboard navigation support

**Props:**

```typescript
interface StartingPointSelectorProps {
  projectId: string;
  selectedEventKey: string | null;
  onEventKeyChange: (eventKey: string | null) => void;
}
```

#### 3. Updated FlowGraph Component

**File:** `apps/app/src/app/features/journeys/components/FlowGraph/FlowGraph.tsx`

**Changes:**

- Added `startingEventKey` state
- Integrated `StartingPointSelector` component in a header section
- Updated API call to pass filter parameter
- Maintained all existing graph functionality
- Used MUI Box components for proper layout

## Best Practices Implemented

### Backend

1. **Query Parameter Validation:** Validates `startingEventKey` format before processing
2. **SQL Injection Prevention:** Uses parameterized queries with Prisma
3. **Backward Compatibility:** Endpoint works with or without filter
4. **Performance:** Optimized SQL with CTEs for efficient filtering
5. **Error Handling:** Proper try-catch blocks and error propagation

### Frontend

1. **Type Safety:** Full TypeScript typing for all components and API calls
2. **State Management:** React hooks for local state, Redux for API state
3. **Loading States:** Shows loading indicators during data fetch
4. **User Experience:**
   - Clear visual feedback for active filters
   - Easy filter removal with chip delete or button
   - Searchable autocomplete for large event lists
5. **Accessibility:** Proper ARIA labels and keyboard navigation
6. **Component Composition:** Separated concerns into focused components
7. **Memoization:** Proper use of useMemo for derived data

## User Flow

1. **Initial View:** User sees complete path exploration graph
2. **Open Filter:** User sees dropdown with all available events
3. **Search/Select:** User can type to search or browse events
4. **View Filtered:** Graph updates to show only paths starting from selected event
5. **Clear Filter:** User clicks chip delete or "Clear Filter" button to reset

## Testing Checklist

- [ ] Backend returns all paths when no filter applied
- [ ] Backend returns filtered paths when `startingEventKey` provided
- [ ] Backend handles invalid `startingEventKey` gracefully
- [ ] Event identities endpoint returns correct data
- [ ] Frontend dropdown populates with events
- [ ] Selecting event updates graph
- [ ] Clear filter button works
- [ ] Graph re-renders correctly on filter change
- [ ] Loading states display properly
- [ ] No console errors or warnings

## Future Enhancements

1. **Multiple Starting Points:** Allow filtering by multiple events
2. **Event Categories:** Group events by type in dropdown
3. **Recent Selections:** Show recently used filters
4. **URL State:** Persist filter in URL for sharing
5. **Analytics:** Track which filters users apply most
6. **Export Filtered Data:** Download filtered path data
