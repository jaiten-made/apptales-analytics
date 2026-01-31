import type { EventProperties } from "@apptales/types";

// Detect common PII patterns
export const piiPatterns: RegExp[] = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
];

export const containsPII = (text: string): boolean =>
  piiPatterns.some((pattern) => pattern.test(text));

const sanitizeObject = (input: unknown): unknown => {
  if (input === null || typeof input !== "object") return input;

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item));
  }

  const result: Record<string, unknown> = {};
  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    if (typeof value === "string") {
      result[key] = containsPII(value) ? "[REDACTED]" : value;
    } else if (value !== null && typeof value === "object") {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  });

  return result;
};

export const sanitizeProperties = (
  properties: EventProperties
): EventProperties => {
  const cloned = structuredClone(properties);
  return sanitizeObject(cloned) as EventProperties;
};
