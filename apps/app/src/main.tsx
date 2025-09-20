import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./app";
import journeysRoute from "./app/features/journeys/route";
import "./global.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [journeysRoute],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
