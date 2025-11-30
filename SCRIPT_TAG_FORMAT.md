## ✅ Updated Script Tag Format

The integration modal now generates a clean, semantic script tag using the `data-project-id` attribute:

### **Final Format:**

```html
<script 
  async 
  src="http://localhost:3001/tracker.js" 
  data-project-id="YOUR_PROJECT_ID_HERE">
</script>
```

### **Why This Format?**

✅ **Standard HTML** - Uses the conventional `data-*` attribute pattern  
✅ **Clean & Readable** - Multi-line format is easy to read and maintain  
✅ **Semantic** - The data attribute clearly indicates its purpose  
✅ **Async Loading** - Placed at the top for clarity, won't block rendering  
✅ **Easy to Parse** - The tracker.js can easily read `currentScript.dataset.projectId`  

### **How the Tracker Reads It:**

```javascript
// Inside tracker.js
const currentScript = document.currentScript;
const projectId = currentScript.dataset.projectId;
// or
const projectId = currentScript.getAttribute('data-project-id');
```

### **Example in Context:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Awesome Website</title>
  
  <!-- AppTales Tracking -->
  <script 
    async 
    src="http://localhost:3001/tracker.js" 
    data-project-id="abc123xyz">
  </script>
</head>
<body>
  <h1>Welcome to my site!</h1>
</body>
</html>
```

### **Benefits Over Other Approaches:**

| Approach | Example | Pros | Cons |
|----------|---------|------|------|
| **Data Attribute** ✅ | `data-project-id="abc"` | Clean, semantic, standard | None |
| Query Parameter | `src="...?projectId=abc"` | Simple | Mixes config with URL |
| Config Object | `window.config = {...}` | Flexible | Requires extra code |
| Inline Script | `<script>...</script>` | Self-contained | Verbose, harder to read |

The `data-project-id` approach is the cleanest and most maintainable solution!
