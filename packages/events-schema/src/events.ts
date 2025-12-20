import { z } from "zod";

export const EventPayloadSchema = z.union([
  z.object({
    type: z.literal("page_view"),
    properties: z.object({
      location: z.object({
        pathname: z.string(),
      }),
    }),
  }),
  z.object({
    type: z.string().superRefine((val, ctx) => {
      if (val === "page_view") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Use specific page_view schema for page_view events",
        });
      }
    }),
    properties: z.record(z.unknown()).optional(),
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
