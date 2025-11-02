import cors from "cors";
import express, { Response } from "express";
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

app.get("/", (_, res: Response) => {
  res.send("success");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
