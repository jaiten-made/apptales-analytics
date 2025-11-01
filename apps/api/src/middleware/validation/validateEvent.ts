import { safeParseEvent } from "@apptales/events-schema";
import { NextFunction, Request, Response } from "express";

export const validateEvent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = safeParseEvent(req.body);
  if (!parsed.success) return res.status(401).json(parsed.error);
  // Attach validated data to request for use in route handler
  req.body = parsed.data;
  next();
};
