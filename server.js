import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
import app from "./app.js";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);

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