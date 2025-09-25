import { lazy } from "react";
import type { RouteObject } from "react-router";
import { getStoryById } from "./service";

const Stories = lazy(() => import("./index"));
const StoryDetail = lazy(() => import("./components/details/Detail"));
const StoriesTable = lazy(() => import("./components/DataTable/DataTable"));

const storiesRoute: RouteObject = {
  path: "stories",
  // element lazy-loads the feature's default export which includes the header and an Outlet
  element: <Stories />,
  children: [
    {
      index: true,
      // index route shows the DataTable inside the Stories layout
      element: <StoriesTable />,
    },
    {
      path: ":id",
      element: <StoryDetail />,
      loader: async ({ params }) => {
        const { id } = params;
        if (!id) return null;
        const story = await getStoryById(id);
        if (!story) {
          // returning null — component can handle missing data
          return null;
        }
        return story;
      },
    },
    {
      path: ":id/user-stories/:userStoryId",
      element: <p>User Story Detail</p>,
    },
  ],
};

export default storiesRoute;
