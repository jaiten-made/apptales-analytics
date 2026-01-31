import { Resend } from "resend";

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export const sendEmail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  const client = getResend();
  const { data, error } = await client.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html: text,
  });

  if (error) throw new Error(`Failed to send email: ${error.message}`);

  return data;
};
