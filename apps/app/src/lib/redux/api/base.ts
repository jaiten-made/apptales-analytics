import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum TAGS {
  EVENTS = "events",
  PROJECT = "project",
  AUTH = "auth",
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: [...Object.values(TAGS)],
  endpoints: () => ({}),
});

export default api;
