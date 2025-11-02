import { Event } from "@apptales/events-schema";
import { generateCuid } from "@apptales/utils";
import { sendEvent } from "./api";

// Session utilities
type Session = { id: string; startedAt: number };
const STORAGE_KEY = "apptales_session";

function getSession(): Session | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    return parsed && parsed.id ? parsed : null;
  } catch {
    return null;
  }
}
function createSession(): Session {
  const s: Session = { id: generateCuid(), startedAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  return s;
}

function createEventTracker() {
  let isInitialized = false;

  // Create session only on first page view and send page_view
  function sendPageView(): void {
    let session = getSession();
    if (!session) {
      session = createSession();
    }
    const pageViewEvent: Event = {
      type: "page_view",
      properties: {
        location: {
          pathname: location.pathname,
        },
      },
      sessionId: session.id,
    };
    sendEvent(pageViewEvent);
  }

  function handleClick(_: MouseEvent): void {
    let session = getSession();
    if (!session) {
      session = createSession();
    }
    const clickEvent: Event = {
      type: "click",
      sessionId: session.id,
    };
    sendEvent(clickEvent);
  }

  function init(): void {
    if (isInitialized) {
      return;
    }

    isInitialized = true;
    // First page view creates the session (if missing) and sends page_view
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
