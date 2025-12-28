import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./app";
import ProtectedRoute from "./app/components/ProtectedRoute";
import SignIn from "./app/features/auth/SignIn";
import journeysRoute from "./app/features/journeys/route";
import ProjectPage from "./app/features/projects/ProjectPage";
import ProjectsList from "./app/features/projects/ProjectsList";
import "./global.css";
import StoreProvider from "./lib/redux/StoreProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects/:projectId",
        element: (
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        ),
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
