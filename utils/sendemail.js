import nodeMailer from "nodemailer";

/**
 * Singleton pooled transporter — created once at module load, reused for
 * every email. Avoids the TCP + TLS handshake overhead on every OTP request.
 * `pool: true` keeps connections warm between sends.
 */
const transporter = nodeMailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true,          // reuse connections instead of opening a new one per email
  maxConnections: 5,   // max simultaneous SMTP connections in the pool
  maxMessages: 100,    // recycle a connection after 100 messages to avoid stale sockets
  rateDelta: 1000,     // sliding window in ms for rate limiting
  rateLimit: 5,        // max emails per rateDelta window
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
 * @param {Object} options
 * @param {string} options.email     - Recipient address
 * @param {string} options.subject   - Email subject
 * @param {string} options.message   - HTML body
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
