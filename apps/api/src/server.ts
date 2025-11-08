import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import HttpError from "./errors/HttpError";
import magicLinkRouter from "./routes/AuthRoute/MagicLink/router";
import eventsRouter from "./routes/EventsRoute/router";
import projectRouter from "./routes/ProjectRoute/router";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"], // app, tracker
    credentials: true,
  })
);

app.use(express.json());

app.use("/events", eventsRouter);
app.use("/projects/:projectId", projectRouter);
app.use("/auth/magic-link", magicLinkRouter);

// Centralized error handler for this router
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.errors });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }
  res.status(500).json({ message: "Unknown error" });
});

app.get("/", (_, res: Response) => {
  res.send("success");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
