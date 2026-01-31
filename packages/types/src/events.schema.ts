import { z } from "zod";

// Zod schema for PAGE_VIEW event properties
export const pageViewPropertiesSchema = z.object({
  location: z.object({
    pathname: z.string(),
  }),
});

// Zod schema for CLICK event properties
export const clickPropertiesSchema = z.object({
  selector: z.string(),
  textContent: z.string(),
});

export const eventPropertiesSchema = z.union([
  pageViewPropertiesSchema,
  clickPropertiesSchema,
]);

// Discriminated union schema for events
export const eventWithPropertiesSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("page_view"),
    properties: pageViewPropertiesSchema,
  }),
  z.object({
    type: z.literal("click"),
    properties: clickPropertiesSchema,
  }),
]);

export const EventSchema = z.intersection(
  z.object({
    sessionId: z.string(),
  }),
  eventWithPropertiesSchema
);

export const SendEventPayloadSchema = eventWithPropertiesSchema;

// Infer TypeScript types from Zod schemas
export type Event = z.infer<typeof EventSchema>;
export type EventWithProperties = z.infer<typeof eventWithPropertiesSchema>;
export type EventProperties = z.infer<typeof eventPropertiesSchema>;

export type SendEventPayload = z.infer<typeof SendEventPayloadSchema>;

export const safeParseSendEventPayload = (input: unknown) =>
  SendEventPayloadSchema.safeParse(input);
