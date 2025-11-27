import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import path from "path";
import { ZodError } from "zod";
import HttpError from "./errors/HttpError";
import authMagicLinkRouter from "./routes/AuthRoute/MagicLink/router";
import authRouter from "./routes/AuthRoute/router";
import authSessionRouter from "./routes/AuthRoute/Session/router";
import eventsRouter from "./routes/EventsRoute/router";
import projectRouter from "./routes/ProjectRoute/router";

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
    origin: ["http://localhost:3000", "http://localhost:3002"], // app, tracker
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/events", eventsRouter);
app.use("/projects/:projectId", projectRouter);
app.use("/auth/magic-link", authMagicLinkRouter);
app.use("/auth/session", authSessionRouter);
app.use("/auth", authRouter);

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
  console.log(`Server is running on http://localhost:${PORT}`);
});
