import baseApi, { TAGS } from "../base";

const BASE_URL = "/events";

const api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: () => BASE_URL,
      providesTags: [TAGS.EVENTS],
    }),
  }),
});

export const { useGetEventsQuery } = api;
export default api;
