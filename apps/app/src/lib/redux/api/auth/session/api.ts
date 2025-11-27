import baseApi, { TAGS } from "../../base";

const BASE_URL = "/auth/session";

const api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifySession: builder.query<void, void>({
      query: () => ({
        url: `${BASE_URL}/verify`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: [TAGS.AUTH],
    }),
  }),
});

export const { useVerifySessionQuery } = api;
export default api;
