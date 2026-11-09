import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
