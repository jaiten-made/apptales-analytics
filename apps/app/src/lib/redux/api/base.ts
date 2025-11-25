import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum TAGS {
  EVENTS = "events",
  PROJECT = "project",
  AUTH = "auth",
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001",
  }),
  tagTypes: [...Object.values(TAGS)],
  endpoints: () => ({}),
});

export default api;
