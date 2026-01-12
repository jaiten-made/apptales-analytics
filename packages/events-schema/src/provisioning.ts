import { z } from "zod";

export const ProvisioningRequestSchema = z.object({
  clientEmail: z.string().email(),
  organizationName: z.string().min(1, "Organization name is required"),
});

export type ProvisioningRequest = z.infer<typeof ProvisioningRequestSchema>;
