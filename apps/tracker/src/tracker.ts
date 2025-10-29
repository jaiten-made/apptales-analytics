import { sendEvent } from "./api";
import type { Event } from "./types";

function createEventTracker() {
  let isInitialized = false;

  function getElementText(element: HTMLElement): string | undefined {
    const text = element.textContent?.trim().slice(0, 100);
    return text || undefined;
  }

  function handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickEvent: Event = {
      type: "click",
      data: {
        name: getElementText(target) || target.tagName,
      },
    };

    sendEvent(clickEvent)
      .then((data: any) => {
        console.log("Event posted successfully:", data);
      })
      .catch((error: any) => {
        console.error("Error posting event:", error);
      });
  }

  function init(): void {
    if (isInitialized) {
      return;
    }

    isInitialized = true;
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
