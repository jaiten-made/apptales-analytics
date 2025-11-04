import baseApi from "../../base";

interface PathExplorationData {
  from_event: string;
  to_event: string;
  count: number;
}

const BASE_URL = (projectId: string) => `/projects/${projectId}`;

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPathExploration: builder.query<PathExplorationData[], string>({
      query: (projectId) => `${BASE_URL(projectId)}/path-exploration`,
    }),
  }),
});

export const { useGetPathExplorationQuery } = projectApi;
