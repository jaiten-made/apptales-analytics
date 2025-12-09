import jwt from "jsonwebtoken";

const SESSION_EXPIRY = "30m";

export interface SessionPayload {
  sessionId: string;
  projectId: string;
}

export const signSessionToken = (
  payload: SessionPayload,
  secret: string
): string => {
  return jwt.sign(payload, secret, { expiresIn: SESSION_EXPIRY });
};

export const verifySessionToken = (
  token: string,
  secret: string
): SessionPayload => {
  return jwt.verify(token, secret) as SessionPayload;
};
