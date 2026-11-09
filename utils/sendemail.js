import * as Brevo from "@getbrevo/brevo";

// Resend uses HTTPS API — no SMTP ports, no IPv6 issues, works on Render free tier
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ email, subject, message }) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = message;
  sendSmtpEmail.sender = {
    name: "Daily Bazar",
    email: process.env.BREVO_SENDER_EMAIL || "noreply@dailybazar.com",
  };
  sendSmtpEmail.to = [{ email }];

  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log(`✉️  Email sent to ${email} — messageId: ${result.messageId}`);
  return result;
};
