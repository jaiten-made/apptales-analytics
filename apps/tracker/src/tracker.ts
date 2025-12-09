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

  // Create session only on first page view and send page_view
  async function sendPageView(): Promise<void> {
    try {
      console.log("Sending page view event");
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

  function init(): void {
    if (isInitialized) return;

    isInitialized = true;

    sendPageView();

    document.addEventListener("click", handleClick, true);
  }

  function destroy(): void {
    document.removeEventListener("click", handleClick, true);
    isInitialized = false;
  }

  // Auto-initialize
  init();

  return {
    destroy,
  };
}

export default createEventTracker;
