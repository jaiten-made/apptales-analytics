import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// POST /events to save click events
app.post("/events", async (req: Request, res: Response) => {
  const { type, data } = req.body;
  if (type !== "click") {
    return res.status(400).json({ error: "Only click events are supported." });
  }
  try {
    // Save to Prisma DB - create EventData and Event together
    const event = await prisma.event.create({
      data: {
        type,
        data: {
          create: data,
        },
      },
      include: {
        data: true,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to save event", details: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
