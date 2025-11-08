import nodemailer from "nodemailer";

export const sendEmail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com.au", // for Zoho Mail
    port: 465, // use 465 for SSL, 587 for TLS
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.ZOHO_USER_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: process.env.ZOHO_USER_EMAIL,
    to,
    subject,
    text,
  });
};
