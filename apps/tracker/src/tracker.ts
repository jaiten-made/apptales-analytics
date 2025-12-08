import { Event } from "@apptales/events-schema";
import { generateCuid } from "@apptales/utils";
import { createSession as createDBSession, sendEvent } from "./api";

// Session utilities
type Session = { id: string; startedAt: number };
const STORAGE_KEY = "apptales_session";

function getClientSession(): Session | null {
  console.log("Getting client session");
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    console.log("Got client session:", parsed);
    return parsed && parsed.id ? parsed : null;
  } catch {
    return null;
  }
}

function getProjectId(): string | null {
  console.log("Getting project ID ");
  const script = document.querySelector(
    "script[data-project-id]"
  ) as HTMLScriptElement;
  const projectId = script?.dataset.projectId;
  console.log("Got project id from script tag:", projectId);
  return projectId || null;
}

async function createSession(): Promise<Session> {
  const s: Session = { id: generateCuid(), startedAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  const projectId = getProjectId();
  if (projectId) await createDBSession({ id: s.id, projectId });
  return s;
}

function createEventTracker() {
  let isInitialized = false;

  // Create session only on first page view and send page_view
  async function sendPageView(): Promise<void> {
    console.log("Sending page view event");
    let session = getClientSession();
    if (!session) {
      console.log("While sending page view, no session found. Creating one.");
      session = await createSession();
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
    console.log("Page view event:", pageViewEvent);
    sendEvent(pageViewEvent);
  }

  async function handleClick(_: MouseEvent): Promise<void> {
    let session = getClientSession();
    if (!session) {
      session = await createSession();
    }
    const clickEvent: Event = {
      type: "click",
      sessionId: session.id,
    };
    sendEvent(clickEvent);
  }

  function init(): void {
    if (isInitialized) return;

    isInitialized = true;

    // First page view creates the session (if missing) and sends page_view
    sendPageView();
    // clearSession();

    document.addEventListener("click", handleClick, true);
  }

  function destroy(): void {
    document.removeEventListener("click", handleClick, true);
    isInitialized = false;
  }

  function clearSession(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  // Auto-initialize
  init();

  return {
    destroy,
    clearSession,
  };
}

export default createEventTracker;
