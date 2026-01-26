import { JSX, useEffect, useState } from "react";
import "./App.css";

function App(): JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Fetch
    const init = async () => {
      try {
        const response = await browser.runtime.sendMessage({
          type: "get-session",
        });
        setToken(response.token);
      } catch (err) {
        console.error("Failed to get session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // 2. Listen for "Live" updates
    const handleMessage = (message: { type: string; token: string | null }) => {
      if (message.type === "session:changed") {
        setToken(message.token);
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);

    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Prevent UI flicker
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Apptales</h1>
      <div className="status-badge">
        {token ? (
          <p className="success">✅ Logged In</p>
        ) : (
          <p className="error">❌ Logged Out</p>
        )}
      </div>
    </div>
  );
}

export default App;
