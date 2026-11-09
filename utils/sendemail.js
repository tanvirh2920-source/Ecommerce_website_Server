import nodeMailer from "nodemailer";

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,           // force IPv4 — Render free tier does not support IPv6
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

setImmediate(() => {
  transporter.verify((error) => {
    if (error) {
      console.error("❌ SMTP connection failed:", error.message);
      console.error("   → Check SMTP_MAIL and SMTP_PASSWORD on Render");
    } else {
      console.log("✅ SMTP server is reachable and ready to send mail");
    }
  });
});

export const sendEmail = async ({ email, subject, message }) => {
  const mailOptions = {
    from: `"Daily Bazar" <${process.env.SMTP_MAIL}>`,
    to: email,
    subject,
    html: message,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`✉️  Email sent to ${email} — messageId: ${result.messageId}`);
  return result;
};
