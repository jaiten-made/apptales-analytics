import { EventPayload } from "@apptales/events-schema";
import { sendEvent } from "./api";

const isLocalhostHostname = (): boolean => {
  const { hostname } = window.location;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost");
  console.log("Is localhost hostname:", isLocalhost);
  return isLocalhost;
};

function getProjectId(): string | null {
  console.log("Getting project ID ");
  const script = document.querySelector(
    "script[data-project-id]"
  ) as HTMLScriptElement;
  const projectId = script?.dataset.projectId;
  console.log("Got project id from script tag:", projectId);
  return projectId || null;
}

function createEventTracker() {
  let isInitialized = false;
  let lastTrackedPath = "";
  let lastSentEvent = ""; // Track last sent event to prevent consecutive duplicates

  // Send page_view event - can be called multiple times for SPA navigation
  async function sendPageView(): Promise<void> {
    if (isLocalhostHostname()) return;
    try {
      const currentPath = location.pathname + location.search + location.hash;

      // Avoid duplicate tracking of the same path
      if (currentPath === lastTrackedPath) {
        console.log("Skipping duplicate page view for:", currentPath);
        return;
      }

      lastTrackedPath = currentPath;

      const eventType = "page_view";
      const eventKey = `${eventType}:${location.pathname}`;

      // Check if this is a consecutive duplicate
      if (eventKey === lastSentEvent) {
        console.log("Skipping consecutive duplicate event:", eventKey);
        return;
      }

      console.log("Sending page view event for:", currentPath);

      const projectId = getProjectId();
      if (!projectId) throw new Error("Project ID not found");

      const pageViewEvent: EventPayload = {
        type: "page_view",
        properties: {
          location: {
            pathname: location.pathname,
          },
        },
      };
      console.log("Page view event:", pageViewEvent);
      sendEvent(pageViewEvent, projectId);

      // Update last sent event
      lastSentEvent = eventKey;
    } catch (error) {
      console.error("Failed to send page view event:", error);
    }
  }

  async function handleClick(event: MouseEvent): Promise<void> {
    try {
      if (isLocalhostHostname()) {
        console.log("Skipping tracking on localhost");
        return;
      }
      const target = event.target as Element;
      // prioritize interactive elements
      const element =
        target.closest('button, a, input, [role="button"]') || target;

      let identifier =
        element.getAttribute("data-track-id") ||
        element.getAttribute("aria-label") ||
        ("innerText" in element ? (element as HTMLElement).innerText : "") ||
        (element instanceof HTMLInputElement ? element.value : "") ||
        element.id ||
        pluginFallbackIdentifier(element);

      if (!identifier) return;

      identifier = identifier.trim();
      if (identifier.length === 0) return;
      if (identifier.length > 50)
        identifier = identifier.substring(0, 50) + "...";

      const eventType = `click:${identifier}`;

      // Check if this is a consecutive duplicate
      if (eventType === lastSentEvent) {
        console.log("Skipping consecutive duplicate click:", eventType);
        return;
      }

      const clickEvent: EventPayload = {
        type: eventType,
      };

      const projectId = getProjectId();
      if (!projectId) return;

      sendEvent(clickEvent, projectId);

      // Update last sent event
      lastSentEvent = eventType;
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  }

  function pluginFallbackIdentifier(el: Element): string {
    // Basic fallback for images or special cases
    if (el.tagName.toLowerCase() === "img") {
      return el.getAttribute("alt") || "";
    }
    return "";
  }

  // Intercept History API for SPA navigation tracking (industry standard approach)
  function setupNavigationTracking(): void {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      sendPageView();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      sendPageView();
    };

    // Track popstate (back/forward button)
    window.addEventListener("popstate", () => {
      sendPageView();
    });

    // Track hash changes (for hash-based routing)
    window.addEventListener("hashchange", () => {
      sendPageView();
    });
  }

  function init(): void {
    if (isInitialized) return;

    isInitialized = true;

    // Track initial page view
    sendPageView();

    // Set up SPA navigation tracking
    setupNavigationTracking();

    // Track clicks
    document.addEventListener("click", handleClick, true);
  }

  function destroy(): void {
    document.removeEventListener("click", handleClick, true);
    isInitialized = false;
    lastTrackedPath = "";
    lastSentEvent = "";
  }

  // Auto-initialize
  init();

  return {
    destroy,
    trackPageView: sendPageView, // Expose for manual tracking if needed
  };
}

export default createEventTracker;
