import { lazy } from "react";
import type { RouteObject } from "react-router";

const Journeys = lazy(() => import("./index"));

const journeysRoute: RouteObject = {
  path: "journeys",
  // element lazy-loads the feature's default export
  element: <Journeys />,
};

export default journeysRoute;
