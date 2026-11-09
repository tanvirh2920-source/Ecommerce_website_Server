/**
 * Brevo (Sendinblue) Transactional Email via REST API
 * No SDK — plain fetch call to HTTPS endpoint.
 * Works on Render free tier, sends to any email, 300/day free.
 */
export const sendEmail = async ({ email, subject, message }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Daily Bazar",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      subject,
      htmlContent: message,
    }),
  });

 if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is not set — emails will fail");
}

export const sendEmail = async ({ email, subject, message }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Daily Bazar",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      subject,
      htmlContent: message,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("❌ Brevo email failed:", err.message);
    throw new Error(`Failed to send email: ${err.message}`);
  }

  const data = await response.json();
  console.log(`✉️  Email sent to ${email} — messageId: ${data.messageId}`);
  return data;
};
