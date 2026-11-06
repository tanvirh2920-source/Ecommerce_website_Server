import nodeMailer from "nodemailer";

/**
 * Singleton transporter — created once at module load, reused for every email.
 *
 * Gmail-specific notes:
 * - Do NOT mix `service` with `host`/`port` — nodemailer's built-in Gmail
 *   preset already sets the correct host, port, and TLS settings. Overriding
 *   them causes connection conflicts and silent timeouts.
 * - `pool: true` with Gmail causes OAuth/App-Password auth to hang on Render's
 *   network because Gmail closes idle pooled connections aggressively. Use the
 *   default non-pooled mode instead — nodemailer reuses the connection within
 *   a single send and closes it cleanly after.
 */
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Verify SMTP connectivity once at startup so misconfiguration surfaces
 * immediately in logs rather than silently at the first OTP request.
 */
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("✅ SMTP server is reachable and ready to send mail");
  }
});

/**
 * @param {Object}  options
 * @param {string}  options.email    - Recipient address
 * @param {string}  options.subject  - Email subject line
 * @param {string}  options.message  - HTML body
 */
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
