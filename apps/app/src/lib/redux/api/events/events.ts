import baseApi, { TAGS } from "../base";

export type EventListItem = {
  id?: string;
  _id?: string;
  name?: string;
  label?: string;
  type?: string;
};

const BASE_URL = "/events";

const api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventListItem[], void>({
      query: () => BASE_URL,
      providesTags: [TAGS.EVENTS],
    }),
  }),
});

export const { useGetEventsQuery } = api;
export default api;
