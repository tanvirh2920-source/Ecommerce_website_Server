import dotenv from "dotenv";
// In development, load from config/config.env.
// On Render, this file doesn't exist (it's gitignored) — dotenv will silently
// skip it and all env vars come from Render's own environment injection instead.
// dotenv v17 logs "injecting env (0)" when the file is missing — that is expected.
dotenv.config({ path: "./config/config.env", quiet: true });
import app from "./app.js";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // Confirm critical env vars are present — if any are missing the value will
  // show as "undefined" in logs and you'll know exactly what to add on Render.
  console.log("🔍 Env check →", {
    SMTP_MAIL: process.env.SMTP_MAIL || "❌ NOT SET",
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? "✅ set" : "❌ NOT SET",
    DB_HOST: process.env.DB_HOST || "❌ NOT SET",
    FRONTEND_URL: process.env.FRONTEND_URL || "❌ NOT SET",
    DASHBOARD_URL: process.env.DASHBOARD_URL || "❌ NOT SET",
    BACKEND_URL: process.env.BACKEND_URL || "❌ NOT SET",
  });

  // Keep-alive ping: Render free tier spins down after 15 min of inactivity,
  // causing 30-60s cold starts. Pinging our own health endpoint every 10 min
  // keeps the dyno warm without hitting any external service.
  if (process.env.BACKEND_URL) {
    const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    setInterval(async () => {
      try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/health`);
        console.log(` Keep-alive ping — status: ${res.status}`);
      } catch (err) {
        // Non-fatal: server may be briefly busy — will retry next interval
        console.warn("⚠️  Keep-alive ping failed:", err.message);
      }
    }, PING_INTERVAL_MS);
  } else {
    console.warn("⚠️  BACKEND_URL not set — keep-alive ping disabled (add it in config.env)");
  }
});

// Graceful shutdown: finish in-flight requests before closing SMTP pool / DB
process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});