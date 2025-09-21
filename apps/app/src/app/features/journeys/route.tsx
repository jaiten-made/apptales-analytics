import { lazy } from "react";
import type { RouteObject } from "react-router";

const Journeys = lazy(() => import("./index"));
const JourneyDetail = lazy(() => import("./components/Detail"));
const JourneysTable = lazy(() => import("./components/DataTable/DataTable"));

const journeysRoute: RouteObject = {
  path: "journeys",
  // element lazy-loads the feature's default export which includes the header and an Outlet
  element: <Journeys />,
  children: [
    {
      index: true,
      // index route shows the DataTable inside the Journeys layout
      element: <JourneysTable />,
    },
    {
      path: ":id",
      element: <JourneyDetail />,
    },
  ],
};

export default journeysRoute;
