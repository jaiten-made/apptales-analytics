import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import App from "./app";
import storiesRoute from "./app/features/stories/route";
import "./global.css";
import StoreProvider from "./lib/redux/StoreProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [storiesRoute],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>
);
