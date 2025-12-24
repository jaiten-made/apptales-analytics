import type { NextFunction, Request, Response } from "express";

export const applyCorsAllowOrigin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allowedOrigin = process.env.TRACKER_BASE_URL;
  console.log();
  if (allowedOrigin) {
    res.set("Access-Control-Allow-Origin", allowedOrigin);
  }
  next();
};
