import { Event } from "@apptales/events-schema";
import { Session } from "./types";

const API_URL = "http://localhost:3001";

export const sendEvent = async (event: Event) => {
  console.log("Sending event:", event);
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error sending event:", error);
  }
};

export const createSession = async (session: Session) => {
  console.log(`Creating session: session=${JSON.stringify(session)}`);
  try {
    const response = await fetch(`${API_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(session),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    console.log(`Created session: data=${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.error("Error sending event:", error);
  }
};
