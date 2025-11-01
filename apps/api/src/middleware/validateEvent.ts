import { safeParseEvent } from "@apptales/events-schema";
import { NextFunction, Request, Response } from "express";

export const validateEvent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = safeParseEvent(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      error: "Invalid event payload",
      details: errors,
    });
  }

  // Attach validated data to request for use in route handler
  req.body = parsed.data;
  next();
};
