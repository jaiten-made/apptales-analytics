import { NextFunction, Request, Response } from "express";

/**
 * Middleware to disable CORS for specific routes
 * Removes CORS headers and handles preflight requests
 * This completely bypasses CORS restrictions for routes where it's applied
 */
export const disableCors = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove all CORS headers
  const corsHeaders = [
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
    "Access-Control-Allow-Methods",
    "Access-Control-Allow-Headers",
    "Access-Control-Expose-Headers",
    "Access-Control-Max-Age",
  ];

  corsHeaders.forEach((header) => res.removeHeader(header));

  next();
};
