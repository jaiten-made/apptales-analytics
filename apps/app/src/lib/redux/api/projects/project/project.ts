import type { FlowGraph } from "@apptales/events-schema";
import baseApi from "../../base";

export interface PathTransition {
  from: {
    id: string;
    type: string;
  };
  to: {
    id: string;
    type: string;
  };
  count: number;
}

const BASE_URL = (projectId: string) => `/projects/${projectId}`;

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPathExploration: builder.query<FlowGraph, string>({
      query: (projectId) => `${BASE_URL(projectId)}/path-exploration`,
    }),
  }),
});

export const { useGetPathExplorationQuery } = projectApi;
