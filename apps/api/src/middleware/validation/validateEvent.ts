import { safeParseSendEventPayload } from "@apptales/types";
import { NextFunction, Request, Response } from "express";

export const validateEventPayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = safeParseSendEventPayload(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  next();
};
