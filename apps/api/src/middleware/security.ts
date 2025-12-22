import express from "express";
import rateLimit from "express-rate-limit";
import { isbot } from "isbot";

export const botDetectionMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const userAgent: string | undefined = req.headers["user-agent"] as
    | string
    | undefined;

  // Skip bot detection for railway health check
  if (userAgent && userAgent.includes("RailwayHealthCheck")) {
    next();
    return;
  }

  if (userAgent && isbot(userAgent)) {
    console.warn(`Bot detected and blocked: ${userAgent}`);
    res.status(403).send("Access Denied: Bot detected");
    return;
  }
  next();
};

// Dashboard/Admin routes - generous limits for authenticated users
export const dashboardRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 2000, // Allow frequent dashboard interactions and data queries
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// Tracking routes - very high limit to prevent abuse while allowing legitimate high-volume traffic
export const trackingRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10000, // High limit for event/session tracking
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Rate limit exceeded for tracking endpoints.",
});

// Auth session validation - high limit as it's called frequently
export const authSessionRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 1000, // High limit for session validation
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many session requests, please try again later.",
});

// Magic link - strict limit to prevent email spam
export const authMagicLinkRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Strict limit to prevent abuse
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many login attempts. Please try again later.",
});

// General auth routes
export const authRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 100, // Moderate limit for auth operations
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many authentication requests, please try again later.",
});
