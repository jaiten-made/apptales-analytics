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

export interface EventIdentity {
  id: string;
  key: string;
  type: string;
  name: string;
  category: string;
  eventCount: number;
}

export interface TransitionNode {
  id: string;
  key: string;
  level: number;
  count: number;
  isAggregate?: boolean;
}

export interface TransitionEdge {
  from: string;
  to: string;
  count: number;
  percentage: number;
  avgDurationMs: number | null;
  isAggregate?: boolean;
}

export interface TransitionGraph {
  anchor: {
    id: string;
    key: string;
  };
  nodes: TransitionNode[];
  edges: TransitionEdge[];
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
    createProject: builder.mutation<
      { id: string; name: string },
      { name: string }
    >({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAGS.PROJECT],
    }),
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
    getEventIdentities: builder.query<
      EventIdentity[],
      { projectId: string; category?: string; search?: string }
    >({
      query: ({ projectId, category, search }) => ({
        url: `${BASE_URL(projectId)}/event-identities`,
        params: {
          ...(category && { category }),
          ...(search && { search }),
        },
      }),
    }),
    getTransitions: builder.query<
      TransitionGraph,
      {
        projectId: string;
        anchorEventId: string;
        direction?: "forward" | "backward";
        topN?: number;
        depth?: number;
      }
    >({
      query: ({ projectId, anchorEventId, direction, topN, depth }) => ({
        url: `${BASE_URL(projectId)}/transitions`,
        params: {
          anchorEventId,
          direction: direction || "forward",
          topN: topN || 5,
          depth: depth || 1,
        },
      }),
    }),
    computeTransitions: builder.mutation<
      { message: string },
      { projectId: string }
    >({
      query: ({ projectId }) => ({
        url: `${BASE_URL(projectId)}/transitions/compute`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetEventIdentitiesQuery,
  useGetTransitionsQuery,
  useComputeTransitionsMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
