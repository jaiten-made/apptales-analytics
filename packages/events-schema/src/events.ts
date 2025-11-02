import { z } from "zod";

const BaseEventProperties = z.object({
  sessionId: z.string(),
});

export const EventSchema = z.intersection(
  z.object({
    sessionId: z.string(),
  }),
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("page_view"),
      properties: z.object({
        location: z.object({
          pathname: z.string().url(),
        }),
      }),
    }),
    z.object({
      type: z.literal("click"),
    }),
  ])
);

export type Event = z.infer<typeof EventSchema>;

export const parseEvent = (input: unknown) => EventSchema.parse(input);
export const safeParseEvent = (input: unknown) => EventSchema.safeParse(input);
