import { ProvisioningRequestSchema } from "@apptales/events-schema";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import HttpError from "../errors/HttpError";
import { prisma } from "../lib/prisma/client";
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
  snippet.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

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
    const { customer, project } = await prisma.$transaction(async (tx) => {
      const existingCustomer = await tx.customer.findUnique({
        where: { email: clientEmail },
      });

      const customerRecord =
        existingCustomer ??
        (await tx.customer.create({
          data: { email: clientEmail, status: "PROVISIONED" },
        }));

      const projectRecord = await tx.project.create({
        data: {
          name: organizationName,
          customerId: customerRecord.id,
        },
      });

      return { customer: customerRecord, project: projectRecord };
    });

    const magicLink = buildMagicLink(req, customer.email);
    const trackerSnippet = buildTrackerSnippet(trackerBaseUrl, project.id);

    const emailBody = buildEmailBody(
      organizationName,
      trackerSnippet,
      magicLink
    );

    await sendEmail({
      to: customer.email,
      subject: "Your Apptales tracker is ready",
      text: emailBody,
    });

    res.status(201).json({
      projectId: project.id,
      trackerSnippet,
    });
  } catch (error) {
    next(error);
  }
};
