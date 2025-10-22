import EventTracker from "./tracker";
import type { TrackerConfig } from "./types";

// Auto-initialize if config is found in window
declare global {
  interface Window {
    AppTalesTracker?: EventTracker;
    appTalesTrackerConfig?: TrackerConfig;
  }
}

// Create and export a singleton instance
let trackerInstance: EventTracker | null = null;

export function initTracker(config?: TrackerConfig): EventTracker {
  if (trackerInstance) {
    console.warn("[AppTalesTracker] Tracker already initialized");
    return trackerInstance;
  }

  const finalConfig = config || window.appTalesTrackerConfig || {};
  trackerInstance = new EventTracker(finalConfig);
  trackerInstance.init();

  // Make available globally
  window.AppTalesTracker = trackerInstance;

  return trackerInstance;
}

export function getTracker(): EventTracker | null {
  return trackerInstance;
}

// Auto-init if config is available
if (typeof window !== "undefined" && window.appTalesTrackerConfig) {
  initTracker(window.appTalesTrackerConfig);
}

// Export types and classes
export type * from "./types";
export { EventTracker };

// Default export
export default {
  initTracker,
  getTracker,
  EventTracker,
};
