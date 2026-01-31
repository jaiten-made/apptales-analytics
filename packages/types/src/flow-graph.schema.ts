import { z } from "zod";

// Event schema
export const flowGraphEventSchema = z.object({
  key: z.string(),
  type: z.string(),
  name: z.string(),
});

// Step schema
export const flowGraphStepSchema = z.object({
  step: z.number(),
  event: flowGraphEventSchema,
  count: z.number(),
  exits: z.number().optional(),
});

// Array schema
export const flowGraphSchema = z.array(flowGraphStepSchema);

export type FlowGraphEvent = z.infer<typeof flowGraphEventSchema>;
export type FlowGraphStep = z.infer<typeof flowGraphStepSchema>;
export type FlowGraph = z.infer<typeof flowGraphSchema>;
