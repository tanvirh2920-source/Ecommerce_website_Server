import "./config/cloudinaryConfig.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { createTables } from "./utils/createTables.js";
import { createNewsletterTable } from "./models/newsletterTable.js";
import { connectDB } from "./database/db.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./router/authRouters.js";
import productRouter from "./router/productRouters.js";
import adminRouter from "./router/adminRoute.js";
import orderRouter from "./router/orderRouters.js";
import paymentRouter from "./router/paymentRouters.js";
import newsletterRouter from "./router/newsletterRouters.js";
import returnRouter from "./router/returnRouters.js";
import contactRouter from "./router/contactRouters.js";

const app = express();

// Render (and most cloud platforms) sit behind a reverse proxy.
// Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// on every request and the real client IP is never identified correctly.
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    tempFileDir: "./uploads",
    useTempFiles: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/newsletter", newsletterRouter);
app.use("/api/v1/returns", returnRouter);
app.use("/api/v1/contact", contactRouter);
app.use(errorMiddleware);

// Health check — used by Render's uptime checks and the keep-alive ping
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ONE-TIME admin seed endpoint — DELETE THIS AFTER USE
// Hit: GET https://ecommerce-website-server-qgg9.onrender.com/api/seed-admin?secret=SEED_SECRET

// Fix #2: Wrap startup in a bootstrap function so unhandled rejections
// surface cleanly and terminate the process with a useful error message.
async function bootstrap() {
  await connectDB();
  await createTables();
  await createNewsletterTable();
}

bootstrap().catch((err) => {
  console.error("❌ Failed to bootstrap application:", err);
  process.exit(1);
});

export default app;