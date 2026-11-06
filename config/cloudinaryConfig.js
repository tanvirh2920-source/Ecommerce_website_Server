import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "config.env"), override: false });

const cloudName = process.env.CLOUDINARY_CLIENT_NAME;
const apiKey = process.env.CLOUDINARY_CLIENT_API;
const apiSecret = process.env.CLOUDINARY_CLIENT_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudName || !apiKey || !apiSecret) {
  if (!cloudinaryUrl) {
    throw new Error(
      "Missing Cloudinary configuration. Set CLOUDINARY_CLIENT_NAME, CLOUDINARY_CLIENT_API, and CLOUDINARY_CLIENT_SECRET in config/config.env or CLOUDINARY_URL in environment.",
    );
  }
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

console.log("Cloudinary config loaded:", {
  cloud_name: cloudName || null,
  api_key: !!apiKey,
  api_secret: !!apiSecret,
  cloudinary_url: !!cloudinaryUrl,
});
