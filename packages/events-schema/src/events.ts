import { z } from "zod";

export const EventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("page_view"),
    properties: z.object({
      url: z.string().url(),
      title: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("click"),
    properties: z.object({ elementId: z.string() }),
  }),
]);

export type Event = z.infer<typeof EventSchema>;
export type EventType = Event["type"];
export type EventProperties<TType extends EventType = EventType> = Extract<
  Event,
  { type: TType }
>["properties"];

export const parseEvent = (input: unknown) => EventSchema.parse(input);
export const safeParseEvent = (input: unknown) => EventSchema.safeParse(input);
