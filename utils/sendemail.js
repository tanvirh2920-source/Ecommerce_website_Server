import * as Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

export const sendEmail = async ({ email, subject, message }) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = message;
  sendSmtpEmail.sender = {
    name: "Daily Bazar",
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email }];

  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log(`✉️  Email sent to ${email} — messageId: ${result.messageId}`);
  return result;
};
