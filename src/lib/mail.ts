import nodemailer from "nodemailer";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function createMailTransporter() {
  const smtpPort = Number(requireEnv("SMTP_PORT"));

  return nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: requireEnv("SMTP_USER"),
      pass: requireEnv("SMTP_PASS"),
    },
  });
}

export async function sendSiteMail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const smtpUser = requireEnv("SMTP_USER");
  const transporter = createMailTransporter();

  return transporter.sendMail({
    from: { name: "Happy Ebook", address: smtpUser },
    to,
    subject,
    text,
    html,
    replyTo,
    textEncoding: "base64",
  });
}
