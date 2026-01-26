// entrypoints/background.ts
let cachedToken: string | null = null;

async function updateCachedToken() {
  // Ensure the URL is clean (no trailing slashes)
  const url = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  try {
    const cookie = await browser.cookies.get({
      url,
      name: "session",
    });
    cachedToken = cookie?.value ?? null;
  } catch (e) {
    cachedToken = null;
  }
}

export default defineBackground(() => {
  updateCachedToken();

  // FIX: You need this to answer the App.tsx initial request
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "get-session") {
      sendResponse({ token: cachedToken });
    }
  });

  browser.cookies.onChanged.addListener(async (changeInfo) => {
    const { cookie, removed } = changeInfo;

    // Get hostname from ENV so it works on localhost AND prod
    const apiHostname = new URL(import.meta.env.VITE_API_BASE_URL).hostname;

    if (
      cookie.name === "session" &&
      cookie.domain.includes(apiHostname.replace("localhost", ""))
    ) {
      cachedToken = removed ? null : cookie.value;

      // Broadcast to Popup
      browser.runtime
        .sendMessage({
          type: "session:changed",
          token: cachedToken,
        })
        .catch(() => {
          // Expected error when popup is closed
        });
    }
  });
});
