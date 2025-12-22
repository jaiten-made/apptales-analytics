import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { ZodError } from "zod";
import HttpError from "./errors/HttpError";
import {
  authMagicLinkRateLimitMiddleware,
  authRateLimitMiddleware,
  authSessionRateLimitMiddleware,
  botDetectionMiddleware,
  dashboardRateLimitMiddleware,
  trackingRateLimitMiddleware,
} from "./middleware/security";
import authMagicLinkRouter from "./routes/AuthRoute/MagicLink/router";
import authRouter from "./routes/AuthRoute/router";
import authSessionRouter from "./routes/AuthRoute/Session/router";
import eventsRouter from "./routes/EventsRoute/router";
import projectRouter from "./routes/ProjectRoute/router";
import projectsRouter from "./routes/ProjectsRoute/router";
import sessionsRouter from "./routes/SessionsRoute/router";

const { TokenExpiredError } = jwt;

// Load the environment variables from the specific file
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [process.env.APP_BASE_URL!, process.env.TRACKER_BASE_URL!],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const mountWithRateLimit = (
  route: string,
  middleware: RequestHandler,
  router: express.Router
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
  projectRouter
);

// Auth routes with tiered rate limiting
mountWithRateLimit(
  "/auth/magic-link",
  authMagicLinkRateLimitMiddleware,
  authMagicLinkRouter
);
mountWithRateLimit(
  "/auth/session",
  authSessionRateLimitMiddleware,
  authSessionRouter
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

app.get("/", (_, res: Response) => {
  res.send("success");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.BASE_URL!}:${PORT}`);
});
