import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum TAGS {
  EVENTS = "events",
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
  }),
  tagTypes: [...Object.values(TAGS)],
  endpoints: () => ({}),
});

export default api;
