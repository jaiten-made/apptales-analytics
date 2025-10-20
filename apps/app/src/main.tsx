import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import App from "./app";
import FlowGraphHome from "./app/features/home/FlowGraphHome";
import journeysRoute from "./app/features/journeys/route";
import "./global.css";
import StoreProvider from "./lib/redux/StoreProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <FlowGraphHome />,
      },
      journeysRoute,
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>
);
