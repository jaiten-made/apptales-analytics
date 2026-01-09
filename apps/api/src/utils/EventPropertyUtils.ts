// Detect common PII patterns
export const piiPatterns: RegExp[] = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
];

export const containsPII = (text: string): boolean =>
  piiPatterns.some((pattern) => pattern.test(text));

export const sanitizeProperties = (
  properties: unknown
): { sanitized: unknown } => {
  if (!properties || typeof properties !== "object") {
    return { sanitized: properties };
  }

  let hasPII = false;
  const sanitized = JSON.parse(JSON.stringify(properties));

  const recursiveSanitize = (obj: any): void => {
    if (!obj || typeof obj !== "object") return;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === "string") {
        if (containsPII(value)) {
          hasPII = true;
          obj[key] = "[REDACTED]";
        }
      } else if (typeof value === "object" && value !== null) {
        recursiveSanitize(value);
      }
    });
  };

  recursiveSanitize(sanitized);
  return { sanitized, hasPII };
};
