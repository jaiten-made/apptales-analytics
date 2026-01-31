import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import HttpError from "../errors/HttpError";

const bufferFromSecret = (secret: string): Buffer => Buffer.from(secret);

export const requireAdminSecret = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const configuredSecret = process.env.PROVISIONING_ADMIN_PASSWORD;
  if (!configuredSecret) {
    next(new HttpError(500, "Admin secret is not configured"));
    return;
  }

  const providedSecret = req.header("x-admin-secret");

  if (!providedSecret) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  const configuredBuffer = bufferFromSecret(configuredSecret);
  const providedBuffer = bufferFromSecret(providedSecret);

  if (configuredBuffer.length !== providedBuffer.length) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  const isMatch = timingSafeEqual(configuredBuffer, providedBuffer);
  if (!isMatch) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  next();
};
