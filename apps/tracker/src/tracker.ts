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
  let lastSentEvent = ""; // Track last sent event to prevent consecutive duplicates

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
      const clickedElement = event.target as Element;

      // Extract text content from the element
      const elementText = getElementText(clickedElement);
      const eventType =
        elementText || pluginFallbackIdentifier(clickedElement) || "click";

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

  function getElementText(element: Element): string {
    const SENSITIVE_INPUT_TYPES = ["password", "email", "tel", "hidden"];
    const MAX_LENGTH = 100;

    // Handle input elements
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      if (
        element instanceof HTMLInputElement &&
        SENSITIVE_INPUT_TYPES.includes(element.type.toLowerCase())
      ) {
        return "";
      }

      const inputText = element.placeholder || element.name || "";
      return sanitizeText(inputText, MAX_LENGTH);
    }

    // Priority order for other elements
    const sources = [
      element.getAttribute("data-track-label"),
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      (element as HTMLElement).innerText,
      element.textContent,
    ];

    for (const source of sources) {
      if (source) {
        const sanitized = sanitizeText(source, MAX_LENGTH);
        if (sanitized) return sanitized;
      }
    }

    return "";
  }

  function sanitizeText(text: string, maxLength: number): string {
    const trimmed = text.trim().substring(0, maxLength);
    if (!trimmed || containsPII(trimmed)) {
      return "";
    }
    return trimmed;
  }

  function containsPII(text: string): boolean {
    const patterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
    ];

    return patterns.some((pattern) => pattern.test(text));
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
