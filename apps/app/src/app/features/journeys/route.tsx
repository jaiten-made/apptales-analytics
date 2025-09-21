import { lazy } from "react";
import type { RouteObject } from "react-router";
import { getJourneyById } from "./service";

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
      loader: async ({ params }) => {
        const { id } = params;
        if (!id) return null;
        const journey = await getJourneyById(id);
        if (!journey) {
          // returning null — component can handle missing data
          return null;
        }
        return journey;
      },
    },
  ],
};

export default journeysRoute;
