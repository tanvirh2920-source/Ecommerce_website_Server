import { Resend } from "resend";

// Resend uses HTTPS API — no SMTP ports, no IPv6 issues, works on Render free tier
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @param {Object}  options
 * @param {string}  options.email    - Recipient address
 * @param {string}  options.subject  - Email subject line
 * @param {string}  options.message  - HTML body
 */
export const sendEmail = async ({ email, subject, message }) => {
  const { data, error } = await resend.emails.send({
    from: "Daily Bazar <onboarding@resend.dev>",
    to: email,
    subject,
    html: message,
  });

  if (error) {
    console.error("❌ Resend email failed:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`✉️  Email sent to ${email} — id: ${data.id}`);
  return data;
};
