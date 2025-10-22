# 🎯 AppTales Tracker

A lightweight, zero-dependency CDN script for comprehensive website event tracking. Track user interactions, page views, form submissions, errors, and more with minimal setup.

## ✨ Features

- 🖱️ **Click Tracking** - Track all user clicks with detailed element information
- 📝 **Form Submission Tracking** - Monitor form submissions across your site
- 👀 **Page View Tracking** - Automatic page view tracking with referrer data
- 📜 **Scroll Depth Tracking** - Monitor how far users scroll on your pages
- ⚠️ **Error Tracking** - Capture JavaScript errors and unhandled promise rejections
- 📦 **Event Batching** - Efficient batch sending to reduce network requests
- 🎨 **Customizable** - Flexible configuration options
- 🚀 **Lightweight** - No dependencies, minimal bundle size
- 🔒 **Privacy-Focused** - You control where data is sent
- 📱 **Mobile-Friendly** - Works on all modern browsers and devices

## 📦 Installation

### Option 1: CDN (Recommended for production)

Add this to your HTML `<head>` or before closing `</body>`:

```html
<script>
  window.appTalesTrackerConfig = {
    endpoint: "https://your-api.com/track",
    debug: false,
  };
</script>
<script src="https://cdn.your-domain.com/tracker.min.js"></script>
```

### Option 2: NPM/Yarn (For bundled applications)

```bash
npm install apptales-tracker
# or
yarn add apptales-tracker
# or
pnpm add apptales-tracker
```

Then in your JavaScript:

```javascript
import { initTracker } from "apptales-tracker";

const tracker = initTracker({
  endpoint: "https://your-api.com/track",
  debug: true,
});
```

## 🚀 Quick Start

1. **Basic Setup** - Minimal configuration to get started:

```html
<script>
  window.appTalesTrackerConfig = {
    endpoint: "https://your-api.com/track",
  };
</script>
<script src="https://cdn.your-domain.com/tracker.min.js"></script>
```

2. **That's it!** The tracker will automatically start capturing events.

## ⚙️ Configuration Options

All configuration options with their defaults:

```javascript
{
  endpoint: '/api/track',           // Where to send events
  debug: false,                     // Enable console logging
  trackClicks: true,                // Track click events
  trackFormSubmits: true,           // Track form submissions
  trackPageViews: true,             // Track page views
  trackScrollDepth: true,           // Track scroll depth
  trackMouseMovement: false,        // Track mouse movements (can be noisy)
  trackErrors: true,                // Track JavaScript errors
  batchSize: 10,                    // Number of events before sending
  batchInterval: 5000,              // Time (ms) before sending batch
  excludeSelectors: [],             // CSS selectors to exclude from tracking
  customData: {}                    // Custom data to include with all events
}
```

### Configuration Examples

**E-commerce Site:**

```javascript
window.appTalesTrackerConfig = {
  endpoint: "https://analytics.mystore.com/events",
  trackClicks: true,
  trackFormSubmits: true,
  trackPageViews: true,
  batchSize: 20,
  customData: {
    storeId: "store-123",
    environment: "production",
  },
};
```

**Blog/Content Site:**

```javascript
window.appTalesTrackerConfig = {
  endpoint: "https://analytics.myblog.com/track",
  trackScrollDepth: true,
  trackPageViews: true,
  trackClicks: false,
  excludeSelectors: [".admin-panel", ".internal-link"],
  customData: {
    blogVersion: "2.0",
  },
};
```

**SaaS Application:**

```javascript
window.appTalesTrackerConfig = {
  endpoint: "https://analytics.myapp.com/events",
  debug: false,
  trackErrors: true,
  trackFormSubmits: true,
  batchSize: 15,
  batchInterval: 3000,
  customData: {
    userId: "12345",
    plan: "premium",
  },
};
```

## 📊 Event Types

The tracker captures the following event types:

### 1. Click Events

```json
{
  "type": "click",
  "timestamp": 1698765432000,
  "data": {
    "x": 150,
    "y": 200,
    "elementTag": "button",
    "elementId": "signup-btn",
    "elementClass": "btn-primary",
    "elementText": "Sign Up",
    "elementHref": "https://example.com/signup"
  }
}
```

### 2. Page View Events

```json
{
  "type": "pageview",
  "timestamp": 1698765432000,
  "data": {
    "title": "Homepage",
    "referrer": "https://google.com",
    "path": "/"
  }
}
```

### 3. Form Submit Events

```json
{
  "type": "formsubmit",
  "timestamp": 1698765432000,
  "data": {
    "formId": "contact-form",
    "formAction": "/api/contact",
    "formMethod": "POST"
  }
}
```

### 4. Scroll Events

```json
{
  "type": "scroll",
  "timestamp": 1698765432000,
  "data": {
    "depth": 75,
    "maxDepth": 75
  }
}
```

### 5. Error Events

```json
{
  "type": "error",
  "timestamp": 1698765432000,
  "data": {
    "message": "Uncaught TypeError: Cannot read property...",
    "stack": "Error: ...",
    "filename": "app.js",
    "lineno": 42,
    "colno": 15
  }
}
```

## 🔧 Advanced Usage

### Programmatic Control

```javascript
import { initTracker, getTracker } from "apptales-tracker";

// Initialize tracker
const tracker = initTracker({
  endpoint: "https://api.example.com/track",
  debug: true,
});

// Get tracker instance later
const tracker = getTracker();

// Add custom data dynamically
tracker.setCustomData({
  userId: "12345",
  experimentId: "exp-789",
});

// Manually flush events
tracker.flush();

// Destroy tracker (removes all event listeners)
tracker.destroy();
```

### Excluding Elements from Tracking

```javascript
window.appTalesTrackerConfig = {
  endpoint: "https://api.example.com/track",
  excludeSelectors: [
    ".no-track", // All elements with this class
    "#admin-panel", // Specific element by ID
    "[data-private]", // Elements with data attribute
    "button.internal", // Specific element combinations
  ],
};
```

### Custom Event Endpoint

Set up your server to receive events:

```javascript
// Example Express.js endpoint
app.post("/api/track", express.json(), (req, res) => {
  const { events } = req.body;

  // Process events
  events.forEach((event) => {
    console.log("Event:", event.type, event.data);
    // Store in database, send to analytics service, etc.
  });

  res.status(200).json({ success: true });
});
```

## 🏗️ Building from Source

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm check-types
```

## 📁 Output Files

After building, you'll find these files in the `dist/` folder:

- `tracker.min.js` - IIFE format (for direct script tags)
- `tracker.es.js` - ES module format
- `tracker.umd.js` - UMD format (universal)

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Data Privacy

This tracker does NOT:

- ❌ Collect personally identifiable information (PII) by default
- ❌ Store data on third-party servers (you control the endpoint)
- ❌ Use cookies or local storage
- ❌ Track users across different websites

This tracker DOES:

- ✅ Send data only to your specified endpoint
- ✅ Allow you to exclude sensitive elements
- ✅ Generate anonymous session IDs per page load
- ✅ Give you complete control over what data is tracked

## 🧪 Testing

1. Open `index.html` in your browser (or run `pnpm dev`)
2. Open browser DevTools
3. Go to Network tab
4. Interact with the page
5. See events being sent to your endpoint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use in your projects!

## 🐛 Issues & Support

Found a bug or have a feature request? [Open an issue](https://github.com/yourusername/apptales/issues)

## 🚀 Roadmap

- [ ] A/B testing integration
- [ ] Heatmap generation
- [ ] Session replay
- [ ] Custom event types
- [ ] TypeScript definitions export
- [ ] React/Vue/Angular plugins

---

Made with ❤️ by the AppTales team
