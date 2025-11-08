import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./app";
import SignIn from "./app/features/auth/SignIn";
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
      {
        path: "auth/signin",
        element: <SignIn />,
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
