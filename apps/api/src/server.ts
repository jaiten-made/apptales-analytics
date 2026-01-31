import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { ZodError } from "zod";
import { db } from "./db"; // Import your Drizzle database instance
import HttpError from "./errors/HttpError";
import corsMiddleware from "./middleware/cors";
import {
  authMagicLinkRateLimitMiddleware,
  authRateLimitMiddleware,
  authSessionRateLimitMiddleware,
  botDetectionMiddleware,
  dashboardRateLimitMiddleware,
  trackingRateLimitMiddleware,
} from "./middleware/security";
import authRouter from "./routes/auth/auth.router";
import authMagicLinkRouter from "./routes/auth/magic-link/magic-link.router";
import authSessionRouter from "./routes/auth/session/session.router";
import eventsRouter from "./routes/events/events.router";
import projectRouter from "./routes/project/project.router";
import projectsRouter from "./routes/projects/projects.router";
import provisioningRouter from "./routes/provisioning/provisioning.router";
import sessionsRouter from "./routes/sessions/sessions.router";

const { TokenExpiredError } = jwt;

// Load the environment variables from the specific file
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`,
  ),
});

const app = express();
app.set("trust proxy", 1);

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

const mountWithRateLimit = (
  route: string,
  middleware: RequestHandler,
  router: express.Router,
): void => {
  if (process.env.NODE_ENV === "production") {
    app.use(route, middleware, router);
    return;
  }
  app.use(route, router);
};

if (process.env.NODE_ENV === "production") {
  app.use(botDetectionMiddleware);
}

// Events and sessions routes - high limit to allow legitimate traffic while preventing abuse
mountWithRateLimit("/events", trackingRateLimitMiddleware, eventsRouter);
mountWithRateLimit("/sessions", trackingRateLimitMiddleware, sessionsRouter);

// Dashboard routes with generous rate limiting for authenticated users
mountWithRateLimit("/projects", dashboardRateLimitMiddleware, projectsRouter);
mountWithRateLimit(
  "/projects/:projectId",
  dashboardRateLimitMiddleware,
  projectRouter,
);
mountWithRateLimit(
  "/admin/provision",
  dashboardRateLimitMiddleware,
  provisioningRouter,
);

// Auth routes with tiered rate limiting
mountWithRateLimit(
  "/auth/magic-link",
  authMagicLinkRateLimitMiddleware,
  authMagicLinkRouter,
);
mountWithRateLimit(
  "/auth/session",
  authSessionRateLimitMiddleware,
  authSessionRouter,
);
mountWithRateLimit("/auth", authRateLimitMiddleware, authRouter);

// Centralized error handler for this router
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (error instanceof ZodError)
    return res.status(400).json({ message: error.errors });
  if (error instanceof HttpError)
    return res.status(error.status).json({ message: error.message });
  if (error instanceof TokenExpiredError)
    return res.status(401).json({ message: "Session has expired" });
  // This needs to be the last error check
  if (error instanceof Error)
    return res.status(500).json({ message: error.message });
  res.status(500).json({ message: "Unknown error" });
});

app.get("/health", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Railway sets the port value automatically, don't put in env file
const port = Number(process.env.PORT) || 3001;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`🚀 API ready at http://${host}:${port}`);
});
