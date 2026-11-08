import { emailTransporter } from "../config/email.js";

export async function sendEmail({ to, subject, html }) {
  return emailTransporter.sendMail({
    from: `"AutoCare Manager" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
