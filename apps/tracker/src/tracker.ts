import { EventPayload } from "@apptales/events-schema";
import { sendEvent } from "./api";

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

  // Send page_view event - can be called multiple times for SPA navigation
  async function sendPageView(): Promise<void> {
    try {
      const currentPath = location.pathname + location.search + location.hash;
      
      // Avoid duplicate tracking of the same path
      if (currentPath === lastTrackedPath) {
        console.log("Skipping duplicate page view for:", currentPath);
        return;
      }
      
      lastTrackedPath = currentPath;
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
    } catch (error) {
      console.error("Failed to send page view event:", error);
    }
  }

  async function handleClick(_: MouseEvent): Promise<void> {
    const clickEvent: EventPayload = {
      type: "click",
    };
    const projectId = getProjectId();
    if (!projectId) throw new Error("Project ID not found");
    sendEvent(clickEvent, projectId);
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
  }

  // Auto-initialize
  init();

  return {
    destroy,
    trackPageView: sendPageView, // Expose for manual tracking if needed
  };
}

export default createEventTracker;
