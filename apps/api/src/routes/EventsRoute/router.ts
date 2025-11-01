import { safeParseEvent } from "@apptales/events-schema";
import express, { Request, Response } from "express";
import { prisma } from "../../lib/prisma/client";

const router = express.Router();

// @route  GET /events
// @desc   Get all events
router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (error) {
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    }
    res.status(500).json({
      message,
    });
  }
});

// POST /events to save events (validated by Zod)
router.post("/", async (req: Request, res: Response) => {
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
  const { type, properties } = parsed.data;
  try {
    // Save to Prisma DB - simple properties JSON column
    const event = await prisma.event.create({
      data: { type, properties },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to save event", details: error });
  }
});

export default router;
