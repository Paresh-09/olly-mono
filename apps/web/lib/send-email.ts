import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments: { filename: string; content: Buffer }[];
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
    attachments,
  });

  if (Error) {
    throw Error;
  }
}
