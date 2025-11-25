import baseApi, { TAGS } from "../base";

const BASE_URL = "/auth";

const api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendMagicLink: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: `${BASE_URL}/magic-link`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: [TAGS.AUTH],
    }),
  }),
});

export const { useSendMagicLinkMutation } = api;
export default api;
