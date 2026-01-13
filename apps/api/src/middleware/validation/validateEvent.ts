import { safeParseEventPayload } from "@apptales/types";
import { NextFunction, Request, Response } from "express";

export const validateEventPayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = safeParseEventPayload(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  next();
};
