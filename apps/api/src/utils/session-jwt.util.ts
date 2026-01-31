import jwt from "jsonwebtoken";

// Calculate seconds until next UTC midnight for session expiry
// This matches Google Analytics behavior where sessions reset at midnight UTC
const getSecondsUntilMidnight = (): number => {
  const now = new Date();
  // Calculate next UTC midnight
  const nextUtcMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1, // next day
      0,
      0,
      0,
      0,
    ),
  );
  return Math.floor((nextUtcMidnight.getTime() - now.getTime()) / 1000);
};

export interface SessionPayload {
  sessionId: string;
  projectId: string;
}

export const signSessionToken = (
  payload: SessionPayload,
  secret: string,
): string => {
  const expiresIn = getSecondsUntilMidnight();
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifySessionToken = (
  token: string,
  secret: string,
): SessionPayload => {
  return jwt.verify(token, secret) as SessionPayload;
};
