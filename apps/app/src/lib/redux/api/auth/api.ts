import baseApi, { TAGS } from "../base";

const BASE_URL = "/auth";

const api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: `${BASE_URL}/signout`,
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: [TAGS.AUTH],
    }),
  }),
});

export const { useSignOutMutation } = api;
export default api;
