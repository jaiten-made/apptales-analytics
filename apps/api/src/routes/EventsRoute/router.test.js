// Focused PII sanitization tests for EventsRoute
// Run with: pnpm --filter @apptales/api test:events

import assert from "node:assert/strict";
import { describe, test } from "node:test";

// Copied from router.ts to keep parity with production logic
const piiPatterns = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
];

const containsPII = (text) => piiPatterns.some((pattern) => pattern.test(text));

const sanitizeProperties = (properties) => {
  if (!properties || typeof properties !== "object")
    return { sanitized: properties };

  const sanitized = JSON.parse(JSON.stringify(properties));

  const recursiveSanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === "string") {
        if (containsPII(value)) {
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

describe("sanitizeProperties PII handling", () => {
  test("redacts emails", () => {
    const { sanitized } = sanitizeProperties({
      email: "user@example.com",
    });
    assert.equal(sanitized.email, "[REDACTED]");
  });

  test("redacts phone numbers", () => {
    const { sanitized, hasPII } = sanitizeProperties({ phone: "123-456-7890" });
    assert.equal(sanitized.phone, "[REDACTED]");
  });

  test("redacts credit cards", () => {
    const { sanitized, hasPII } = sanitizeProperties({
      card: "1234-5678-9012-3456",
    });
    assert.equal(sanitized.card, "[REDACTED]");
  });

  test("redacts SSN", () => {
    const { sanitized, hasPII } = sanitizeProperties({ ssn: "123-45-6789" });
    assert.equal(sanitized.ssn, "[REDACTED]");
  });

  test("redacts nested PII", () => {
    const { sanitized, hasPII } = sanitizeProperties({
      user: { profile: { email: "user@example.com", phone: "123.456.7890" } },
    });
    assert.equal(sanitized.user.profile.email, "[REDACTED]");
    assert.equal(sanitized.user.profile.phone, "[REDACTED]");
  });

  test("leaves clean data untouched", () => {
    const input = { page: "/home", userAgent: "Mozilla/5.0", count: 3 };
    const { sanitized, hasPII } = sanitizeProperties(input);
    assert.deepEqual(sanitized, input);
    assert.equal(hasPII, false);
  });

  test("handles null/undefined/primitive gracefully", () => {
    assert.deepEqual(sanitizeProperties(null), {
      sanitized: null,
    });
    assert.deepEqual(sanitizeProperties(undefined), {
      sanitized: undefined,
    });
    assert.deepEqual(sanitizeProperties("just text"), {
      sanitized: "just text",
    });
  });
});
