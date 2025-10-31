// apiService.ts

import { Event } from "./types";

const API_URL = "http://localhost:3001/events"; // Update with your actual API URL

export const sendEvent = async (event: Event) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending event:", error);
  }
};
