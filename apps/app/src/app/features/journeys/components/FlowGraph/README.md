# GA4 Behavior Flow Implementation

## Overview

This flow graph has been redesigned to behave like Google Analytics 4 (GA4) behavior flow visualization.

## Key Features

### 1. **Horizontal Left-to-Right Layout**

- Nodes are arranged horizontally from left to right (instead of vertically)
- Represents the user journey progression through stages
- Uses BFS algorithm to determine node levels/depth

### 2. **Traffic Metrics (GA4 Style)**

Each node displays:

- **User Count**: Number of users who reached this step
- **Percentage**: % of total users who reached this point
- **Drop-off Rate**: % of users who dropped off at this step

### 3. **Visual Indicators**

- **Color-coded nodes** based on drop-off rates:
  - Blue: Start node
  - Green: Low drop-off (< 25%)
  - Orange: Medium drop-off (25-50%)
  - Red: High drop-off (> 50%)
- **Status indicator dot**: Green for completed, gray for incomplete
- **Border thickness**: Left border is thicker for visual emphasis

### 4. **Edge Visualization**

- **Variable thickness**: Edges get thicker with more traffic
- **Color-coded**:
  - Green: High traffic (> 50% of total)
  - Orange: Medium traffic (25-50%)
  - Red: Low traffic (< 25%)
- **Labels**: Show how many times a path was taken and the percentage vs alternatives
  - Format examples: `2 times • 67%`, `1 time • 100%`
  - Aggregate view uses total across users; user view uses the selected user's own path
- **Smooth transitions**: Uses "smoothstep" edge type for curved paths

### 5. **Multiple Paths & Branching**

- Supports multiple outgoing edges from a single node
- Shows user behavior splitting (e.g., different choices)
- Example: After "Run Checks", users can choose Public, Private, or Unlisted

### 6. **Interactive Features**

- **Draggable nodes**: Rearrange the layout as needed
- **Zoom & Pan**: Navigate large flows easily
- **Starting node selector**: Change which event starts the flow
- **Hover effects**: Nodes lift slightly on hover

### 7. **Automatic Layout**

- Nodes are automatically positioned based on their depth level
- Vertical spacing for nodes at the same level
- Horizontal spacing between levels (columns)

## Data Structure

The flow accepts nodes with the following properties:

```json
{
  "id": "node_id",
  "data": {
    "label": "Node Title",
    "eventType": "element_click",
    "hasCompleted": true,
    "durationMs": 5000
  }
}
```

## Metrics Calculation

The component automatically calculates:

1. **User flow-through**: Starting from the first node with total users
2. **Random drop-off simulation**: 0-30% drop-off at each step
3. **Percentage calculations**: Relative to the starting total
4. **Edge thickness**: Proportional to traffic volume (1-10px range)

## Example Use Cases

### E-commerce Funnel

```
Home → Product Page → Add to Cart → Checkout → Payment → Confirmation
```

### Video Upload Journey (Current Example)

```
Start Upload → Select File → Processing → Details
                                             ├→ Add Elements → Checks → Visibility → Publish
                                             └→ Skip Elements ┘              ├→ Save Draft
```

### User Onboarding

```
Sign Up → Email Verify → Profile Setup → Tutorial → Dashboard
                                    ├→ Skip Tutorial ┘
```

## Customization

### Adjust Spacing

## Customization

### Adjust Layout with Dagre

```typescript
dagreGraph.setGraph({
  rankdir: "TB", // Direction: TB (top-bottom) or LR (left-right)
  nodesep: 120, // Horizontal spacing between nodes
  ranksep: 180, // Vertical spacing between ranks
  marginx: 50, // Horizontal margin
  marginy: 50, // Vertical margin
});
```

### Change Node Dimensions

```typescript
dagreGraph.setNode(node.id, {
  width: 280, // Node width for layout calculation
  height: 180, // Node height for layout calculation
});
```

### Modify Drop-off Rates

```typescript
const randomDropOff = Math.random() * 0.3; // 0-30% drop-off
```

### Change Starting Traffic

```typescript
const totalUsers = 10000; // Starting user count
```

## Comparison with GA4

| Feature                 | GA4 Behavior Flow | This Implementation     |
| ----------------------- | ----------------- | ----------------------- |
| Horizontal Layout       | ✅                | ✅                      |
| Traffic Metrics         | ✅                | ✅                      |
| Multiple Paths          | ✅                | ✅                      |
| Variable Edge Thickness | ✅                | ✅                      |
| Drop-off Visualization  | ✅                | ✅                      |
| Interactive             | ✅                | ✅                      |
| Real-time Data          | ✅                | 🔄 (Uses mock data)     |
| Explore Mode            | ✅                | 🔄 (Future enhancement) |

## Libraries Used

- **React Flow**: Core flow diagram library
- **Dagre**: Automatic graph layout algorithm
- **Material-UI**: UI components and styling
- **date-fns**: Duration formatting

## Future Enhancements

1. **Real-time data integration**: Connect to actual analytics API
2. **Node expansion**: Click to drill down into sub-flows
3. **Date range selector**: View behavior over different time periods
4. **Segment filtering**: Filter by user demographics or properties
5. **Export capabilities**: Download flow diagrams as PNG/PDF
6. **Custom metrics**: Define your own KPIs to display
7. **A/B test comparison**: Compare flows between variants
8. **Layout switching**: Toggle between TB and LR layouts
9. **Minimap**: Add overview map for large flows
