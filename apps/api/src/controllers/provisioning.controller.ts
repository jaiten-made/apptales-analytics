import { ProvisioningRequestSchema } from "@apptales/types";
import { generateCuid } from "@apptales/utils";
import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index";
import { customer, project } from "../db/schema";
import HttpError from "../errors/HttpError";
import { sendEmail } from "../services/email";

const buildMagicLink = (req: Request, email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new HttpError(500, "Missing JWT secret");
  const token = jwt.sign({ email }, secret, { expiresIn: "14d" });
  const origin = `${req.protocol}://${req.get("host")}`;
  return `${origin}/auth/magic-link/verify?token=${token}`;
};

const buildTrackerSnippet = (
  trackerBaseUrl: string,
  projectId: string
): string =>
  `<script src="${trackerBaseUrl}/tracker.js" data-id="${projectId}"></script>`;

const escapeSnippet = (snippet: string): string =>
  snippet.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const buildEmailBody = (
  organizationName: string,
  trackerSnippet: string,
  magicLink: string
): string => {
  const escapedSnippet = escapeSnippet(trackerSnippet);
  return `
    <p>Hi ${organizationName},</p>
    <p>Your account has been provisioned for <strong>${organizationName}</strong>.</p>
    <p>Add this tracker snippet to your site:</p>
    <pre><code>${escapedSnippet}</code></pre>
    <p>Login to your account via this magic link:</p>
    <p><a href="${magicLink}">${magicLink}</a></p>
  `;
};

export const provisionClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedBody = ProvisioningRequestSchema.parse(req.body);
    const { clientEmail, organizationName } = parsedBody;

    const trackerBaseUrl = process.env.TRACKER_BASE_URL;
    if (!trackerBaseUrl)
      throw new HttpError(500, "Tracker base URL is not configured");

    // Check if customer exists
    const existingCustomers = await db
      .select()
      .from(customer)
      .where(eq(customer.email, clientEmail))
      .limit(1);

    let customerRecord = existingCustomers[0];

    if (!customerRecord) {
      // Create new customer
      const newCustomers = await db
        .insert(customer)
        .values({
          id: generateCuid(),
          email: clientEmail,
          status: "PROVISIONED",
        })
        .returning();
      customerRecord = newCustomers[0];
    }

    // Create project
    const projectRecords = await db
      .insert(project)
      .values({
        id: generateCuid(),
        name: organizationName,
        customerId: customerRecord.id,
      })
      .returning();

    const projectRecord = projectRecords[0];

    const magicLink = buildMagicLink(req, customerRecord.email);
    const trackerSnippet = buildTrackerSnippet(
      trackerBaseUrl,
      projectRecord.id
    );

    const emailBody = buildEmailBody(
      organizationName,
      trackerSnippet,
      magicLink
    );

    await sendEmail({
      to: customerRecord.email,
      subject: "Your Apptales tracker is ready",
      text: emailBody,
    });

    res.status(201).json({
      projectId: projectRecord.id,
      trackerSnippet,
    });
  } catch (error) {
    next(error);
  }
};
