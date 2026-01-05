import { EventPayload } from "@apptales/events-schema";
import { isLocalhostHostname } from "./utils";

/**
 * Declared global constant replaced at build-time by Vite's `define` plugin.
 * This prevents the "import.meta" or "process.env" error in the browser.
 */
declare const __API_BASE_URL__: string;

/**
 * We use the constant injected by the bundler.
 * If for some reason it's undefined during dev, it defaults to the local URL.
 */
const API_URL = __API_BASE_URL__;

export const sendEvent = async (payload: EventPayload, projectId: string) => {
  if (isLocalhostHostname() && import.meta.env.PROD) {
    console.log("Skipping sending event on localhost");
    return;
  }
  console.log("Sending event:", payload);
  try {
    const response = await fetch(`${API_URL}/events?projectId=${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error sending event:", error);
  }
};
