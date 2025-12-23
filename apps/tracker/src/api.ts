import { EventPayload } from "@apptales/events-schema";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const sendEvent = async (payload: EventPayload, projectId: string) => {
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
