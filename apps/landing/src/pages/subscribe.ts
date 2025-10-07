export const prerender = false;
import type { APIRoute } from "astro";

function isValidEmail(value: unknown) {
  if (typeof value !== "string") return false;
  // simple email regex for basic validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const email = data.get("email");

  if (!email || !isValidEmail(email)) {
    return new Response(
      JSON.stringify({ message: "Invalid or missing email" }),
      { status: 400 }
    );
  }
  return new Response(
    JSON.stringify({
      message:
        "Thanks! You're on the waitlist. We'll notify you by email when early access is available.",
    }),
    { status: 201 }
  );
};
