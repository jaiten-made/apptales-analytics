# AGENTS.md - Browser Extension

For workspace-wide conventions and setup, see [docs/agents.md](../../docs/agents.md).

## Project Overview

Browser extension for AppTales Analytics that can be injected into any website without requiring developer integration. Allows testing and demonstrating event tracking capabilities on any site by embedding the tracking script directly through the extension.

### Tech Stack

- **Runtime**: Browser (Chrome/Firefox extensions)
- **Framework**: WXT (Web Extension Toolkit)
- **UI**: React (^19.2.3) with TypeScript
- **Build Tool**: WXT (^0.20.6)
- **TypeScript**: Strict mode with Node.js config (~5.8.3)

## Dev Environment & Setup

### Start Development Mode

```bash
pnpm -F @apptales/extension dev
```

Starts WXT dev server with hot reload for extension development.

### Build for Chrome

```bash
pnpm -F @apptales/extension build
```

Builds optimized extension for Chrome in `dist/` folder.

### Build for Firefox

```bash
pnpm -F @apptales/extension build:firefox
```

Builds extension for Firefox.

### Create Distributable Zip

```bash
# Chrome
pnpm -F @apptales/extension zip

# Firefox
pnpm -F @apptales/extension zip:firefox
```

## Project Structure

```
src/
├── entrypoints/
│   ├── background.ts         - Service worker / background script
│   ├── content.ts            - Content script injected into pages
│   └── popup/
│       └── index.tsx         - Extension popup UI
├── assets/                   - Icons and extension assets
└── vite-env.d.ts            - Vite type definitions

public/
└── icon/                     - Extension icons (multiple sizes)

wxt.config.ts               - WXT configuration
manifest.json               - Extension manifest (auto-generated)
```

## Browser Extension Fundamentals

### Extension Architecture

- **Manifest**: Configuration file defining extension permissions and behavior
- **Background Script**: Persistent/service worker for background tasks
- **Content Script**: Injected into web pages to interact with page content
- **Popup**: UI shown when user clicks extension icon
- **Options Page**: Settings page (optional)

### Entrypoints

#### Background Script (`src/entrypoints/background.ts`)

- Handles extension lifecycle and events
- Listens for messages from content scripts and popup
- Manages state across extension sessions
- Can make API calls without CORS restrictions

#### Content Script (`src/entrypoints/content.ts`)

- Runs in the context of every visited page
- Can access and modify the page DOM
- Communicates with background script via messages
- Injects tracking script into page

#### Popup (`src/entrypoints/popup/index.tsx`)

- React component shown when user clicks extension icon
- Displays current page tracking status
- Provides UI for extension controls
- Shows tracked events on current page

## Event Tracking Integration

### Injecting Tracker Script

The extension injects the AppTales tracking script into any visited page:

```ts
// Content script - injected into page
function injectTracker(projectId: string) {
  const script = document.createElement("script");
  script.src = `https://cdn.apptales.com/tracker.js?projectId=${projectId}`;
  script.async = true;
  document.head.appendChild(script);
}
```

### Configuration

- **Project ID**: User specifies which project to track events for
- **Domains**: Optionally limit injection to specific domains
- **Toggle**: Enable/disable tracking on current page

### Popup Display

The popup shows:

- Tracking status for current page
- Number of events tracked
- Project being tracked
- Option to enable/disable tracking
- Quick access settings

## Permissions

The extension requires specific permissions defined in `manifest.json`:

- `activeTab`: Access current tab information
- `scripting`: Inject scripts into pages
- `storage`: Store user settings (project ID, preferences)
- `host_permissions`: Access content on specified hosts (or `<all_urls>`)

## State Management

### Persistent Storage

Use Chrome Storage API to persist settings:

```ts
// Save project ID
chrome.storage.sync.set({ projectId: "123" });

// Read project ID
const { projectId } = await chrome.storage.sync.get(["projectId"]);
```

### Runtime Communication

Messages between content script and background:

```ts
// Content script sends message
chrome.runtime.sendMessage({ action: "trackEvent", event: {...} });

// Background script listens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "trackEvent") {
    // Handle event
  }
});
```

## Testing

### Run Tests

```bash
pnpm -F @apptales/extension compile
```

Type checks extension code.

### Local Testing

1. Run `pnpm -F @apptales/extension dev`
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder
5. Visit websites and test tracking

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Tracker script is injected on page load
- [ ] Events appear in dashboard
- [ ] Popup shows correct status
- [ ] Settings persist across browser sessions
- [ ] Works on different domains
- [ ] No console errors on target pages

## Building & Deployment

### Development Builds

```bash
pnpm -F @apptales/extension dev
```

Watches for changes and auto-rebuilds.

### Production Build

```bash
pnpm -F @apptales/extension build
```

Creates optimized, minified extension ready for distribution.

### Chrome Web Store Distribution

1. Build extension with `pnpm build`
2. Create zip with `pnpm zip`
3. Upload to Chrome Web Store developer dashboard
4. Add description, screenshots, and permissions rationale
5. Submit for review

### Firefox Add-ons Distribution

1. Build for Firefox with `pnpm build:firefox`
2. Create zip with `pnpm zip:firefox`
3. Upload to Mozilla Add-ons platform
4. Add description and details
5. Submit for review

## WXT Configuration

[wxt.config.ts](./wxt.config.ts) defines:

- Entry points and manifest configuration
- Build optimization settings
- Manifest version and permissions
- Browser targets (Chrome, Firefox, etc.)

## Code Style

- Follow TypeScript strict mode
- Use descriptive variable names
- Keep content scripts minimal (performance sensitive)
- Add comments for complex message handlers
- Test across different domains

## Security Considerations

### Permissions

- Only request necessary permissions
- Explain why each permission is needed
- Use minimum required host permissions

### Content Security

- Validate all data from injected pages
- Don't eval user input
- Use `chrome.runtime.getURL()` for internal resources
- Keep content script isolated from page globals

### Storage

- Don't store sensitive tokens
- Use `chrome.storage.sync` for settings sync across devices
- Validate stored data before using

## Performance Optimization

### Content Script Optimization

- Keep content script code minimal
- Delay non-critical operations
- Use message passing efficiently
- Avoid blocking operations

### Memory Management

- Clean up message listeners
- Remove injected elements when no longer needed
- Avoid memory leaks in background script

## Common Tasks

### Add Configuration Option

1. Add UI control in popup component
2. Save setting to `chrome.storage.sync`
3. Load setting in background script
4. Pass to content script via message
5. Test persistence across sessions

### Modify Tracking Behavior

1. Update content script injection logic
2. Change tracker script URL or parameters
3. Add conditional logic for different domains
4. Test on various websites
5. Verify events in dashboard

### Debug Content Script

1. Right-click on page → Inspect
2. Go to Console tab
3. Choose extension in dropdown at top
4. View logs from content script

## Debugging

### View Extension Logs

1. Open `chrome://extensions`
2. Click "Service worker" under extension
3. View console output

### Debug Content Script

1. Right-click webpage → Inspect → Console
2. Select extension context from dropdown
3. View content script logs

### Test Messaging

Use console to send test messages:

```ts
chrome.runtime.sendMessage({ action: "test" });
```

## Related Documentation

- Root conventions: [docs/agents.md](../../docs/agents.md)
- WXT documentation: https://wxt.dev/
- Chrome Extensions API: https://developer.chrome.com/docs/extensions/
- Firefox WebExtensions: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/
- TypeScript config: [tsconfig.json](./tsconfig.json)
