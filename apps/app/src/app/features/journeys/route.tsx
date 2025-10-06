import { lazy } from "react";
import type { RouteObject } from "react-router";
import { getStoryById } from "./service";
import UserStoryDetail from "./user-journey/details/Details";

const Journeys = lazy(() => import("./index"));
const UserJourneyDetails = lazy(() => import("./components/details/Detail"));
const JourneysTable = lazy(() => import("./components/DataTable/DataTable"));

const storiesRoute: RouteObject = {
  path: "journeys",
  // element lazy-loads the feature's default export which includes the header and an Outlet
  element: <Journeys />,
  children: [
    {
      index: true,
      // index route shows the DataTable inside the Stories layout
      element: <JourneysTable />,
    },
    {
      path: ":id",
      element: <UserJourneyDetails />,
      loader: async ({ params }) => {
        const { id } = params;
        if (!id) return;
        return await getStoryById(id);
      },
    },
    {
      path: ":id/user-journeys/:userStoryId",
      element: <UserStoryDetail />,
    },
  ],
};

export default storiesRoute;
