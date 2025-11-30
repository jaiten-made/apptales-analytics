import type { FlowGraph } from "@apptales/events-schema";
import baseApi, { TAGS } from "../../base";

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
    getProjects: builder.query<
      { id: string; name: string; createdAt: string }[],
      void
    >({
      query: () => "/projects",
      providesTags: [TAGS.PROJECT],
    }),
    createProject: builder.mutation<{ id: string; name: string }, { name: string }>(
      {
        query: (body) => ({
          url: "/projects",
          method: "POST",
          body,
        }),
        invalidatesTags: [TAGS.PROJECT],
      }
    ),
    getProject: builder.query<{ id: string; name: string }, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: TAGS.PROJECT, id }],
    }),
    updateProject: builder.mutation<
      { id: string; name: string },
      { id: string; name: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        TAGS.PROJECT,
        { type: TAGS.PROJECT, id },
      ],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.PROJECT],
    }),
    getPathExploration: builder.query<FlowGraph, string>({
      query: (projectId) => `${BASE_URL(projectId)}/path-exploration`,
    }),
  }),
});

export const {
  useGetPathExplorationQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
