import * as Brevo from "@getbrevo/brevo";

// Brevo (formerly Sendinblue) — 300 free emails/day, no domain required,
// sends to any email address, uses HTTPS API (no SMTP ports blocked on Render)
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

/**
 * @param {Object}  options
 * @param {string}  options.email    - Recipient address
 * @param {string}  options.subject  - Email subject line
 * @param {string}  options.message  - HTML body
 */
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
