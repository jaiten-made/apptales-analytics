import { z } from "zod";

export const EventPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("page_view"),
    properties: z.object({
      location: z.object({
        pathname: z.string(),
      }),
    }),
  }),
  z.object({
    type: z.literal("click"),
  }),
]);

export const EventSchema = z.intersection(
  z.object({
    sessionId: z.string(),
  }),
  EventPayloadSchema // This is the payload defined above
);

export type Event = z.infer<typeof EventSchema>;
export type EventPayload = z.infer<typeof EventPayloadSchema>;

export const parseEvent = (input: unknown) => EventSchema.parse(input);
export const safeParseEvent = (input: unknown) => EventSchema.safeParse(input);

export const safeParseEventPayload = (input: unknown) =>
  EventPayloadSchema.safeParse(input);
