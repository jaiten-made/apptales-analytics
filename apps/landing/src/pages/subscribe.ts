export const prerender = false;
import type { APIRoute } from "astro";
import { google } from "googleapis";
import { RateLimiterMemory } from "rate-limiter-flexible";

function isValidEmail(value: unknown) {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Allow 5 submissions per IP per day
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 86400, // 24 hours
});

async function isRateLimited(ip: string) {
  try {
    await rateLimiter.consume(ip);
    return false;
  } catch (e) {
    return true;
  }
}

async function appendToSheet(sheetName: string, email: string) {
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: import.meta.env.SHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[email]],
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let status = 500;
  try {
    const ip = (request.headers.get("x-forwarded-for") || "unknown") as string;
    const limited = await isRateLimited(ip);
    if (limited) {
      status = 429;
      return new Response(JSON.stringify({ message: "Too many requests" }), {
        status,
      });
    }
    // Support both form-data (from the site) and JSON (from API clients)
    let email: string | null = null;
    const sheetName = "Waitlist";
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email ?? null;
    } else {
      const form = await request.formData();
      const e = form.get("email");
      email = typeof e === "string" ? e : null;
    }
    if (!email || !isValidEmail(email)) {
      status = 400;
      return new Response(
        JSON.stringify({ message: "Invalid or missing email" }),
        { status }
      );
    }
    await appendToSheet(sheetName, email);
    status = 201;
    return new Response(
      JSON.stringify({
        message:
          "Thanks! You're on the waitlist. We'll notify you by email when early access is available.",
      }),
      { status }
    );
  } catch (e) {
    console.error("Failed to add email:", e);
    if (e instanceof Error) {
      return new Response(JSON.stringify({ message: e.message }), { status });
    }
    return new Response(JSON.stringify({ message: "Unknown error" }), {
      status,
    });
  }
};
