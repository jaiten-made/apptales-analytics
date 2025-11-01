import express, { Request, Response } from "express";
import { prisma } from "../../lib/prisma/client";
import { validateEvent } from "../../middleware/validation/validateEvent";

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
router.post("/", validateEvent, async (req: Request, res: Response) => {
  const { type, properties } = req.body;
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
