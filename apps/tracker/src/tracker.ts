import { EventType, SendEventPayload } from "@apptales/types";
import { sendEvent } from "./api";
import { generateSelector } from "./utils";

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

      const eventType = EventType.PAGE_VIEW;
      const eventKey = `${eventType}:${location.pathname}`;

      // Check if this is a consecutive duplicate
      if (eventKey === lastSentEvent) {
        console.log("Skipping consecutive duplicate event:", eventKey);
        return;
      }

      console.log("Sending page view event for:", currentPath);

      const projectId = getProjectId();
      if (!projectId) throw new Error("Project ID not found");

      const pageViewEvent: SendEventPayload = {
        type: eventType,
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

      // Only track clicks on clickable elements
      const clickableElement = findClickableElement(clickedElement);
      if (!clickableElement) {
        return;
      }

      // Generate unique CSS selector for this element
      const cssSelector = generateSelector(clickableElement as HTMLElement);
      const textContent = getTextContent(clickableElement);
      const eventType = EventType.CLICK;
      const eventKey = `${eventType}:${cssSelector}`;

      if (!cssSelector) {
        console.log(
          "Click event has no trackable selector, skipping:",
          clickableElement
        );
        return;
      }

      // Check if this is a consecutive duplicate
      if (eventKey === lastSentEvent) {
        console.log("Skipping consecutive duplicate click:", eventKey);
        return;
      }

      const clickEvent: SendEventPayload = {
        type: eventType,
        properties: {
          textContent,
          selector: cssSelector,
        },
      };

      const projectId = getProjectId();
      if (!projectId) return;

      sendEvent(clickEvent, projectId);

      // Update last sent event
      lastSentEvent = eventKey;
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  }

  function findClickableElement(element: Element | null): Element | null {
    const CLICKABLE_TAGS = ["A", "BUTTON", "SELECT", "LABEL"];
    const MAX_PARENT_DEPTH = 3;
    let currentElement = element;
    let depth = 0;

    while (currentElement && depth < MAX_PARENT_DEPTH) {
      // Check if it's a clickable tag
      if (CLICKABLE_TAGS.includes(currentElement.tagName)) {
        return currentElement;
      }

      // Check if it has role="button" or other clickable roles
      const role = currentElement.getAttribute("role");
      if (role && ["button", "link", "menuitem", "tab"].includes(role)) {
        return currentElement;
      }

      // Check if it has onclick handler or cursor pointer style
      const hasClickHandler = currentElement.hasAttribute("onclick");
      const style = window.getComputedStyle(currentElement as HTMLElement);
      const hasPointerCursor = style.cursor === "pointer";

      if (hasClickHandler || hasPointerCursor) {
        return currentElement;
      }

      // Move up to parent
      currentElement = currentElement.parentElement;
      depth++;
    }

    return null;
  }

  function getTextContent(element: Element): string {
    const SENSITIVE_INPUT_TYPES = new Set([
      "password",
      "email",
      "tel",
      "hidden",
    ]);
    const MAX_LENGTH = 100;

    // 1. Handle Form Controls
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      if (
        element instanceof HTMLInputElement &&
        SENSITIVE_INPUT_TYPES.has(element.type.toLowerCase())
      ) {
        return "";
      }
      const inputText = element.placeholder || element.name || "";
      return sanitizeText(inputText, MAX_LENGTH);
    }

    // 2. Priority Order (Optimized for performance)
    // We check textContent first to avoid layout reflow triggered by innerText
    const source =
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.textContent ||
      "";

    return sanitizeText(source, MAX_LENGTH);
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
