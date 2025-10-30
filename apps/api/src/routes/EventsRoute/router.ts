import express, { Request, Response } from "express";
import { prisma } from "../../lib/prisma/client";

const router = express.Router();

// POST /events to save click events
router.post("/", async (req: Request, res: Response) => {
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

export default router;
