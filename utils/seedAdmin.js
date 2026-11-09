/**
 * Admin Seed Script
 * Run once to create the admin user in the database.
 * Usage: node utils/seedAdmin.js
 *
 * Credentials are read from environment variables — never hardcoded.
 * Set these in config/config.env (local) or Render environment (production).
 */

import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env", quiet: true });

import bcrypt from "bcrypt";
import { connectDB } from "../database/db.js";
import database from "../database/db.js";

const ADMIN_NAME     = process.env.ADMIN_NAME     || "Admin";
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in your environment.");
  process.exit(1);
}

async function seedAdmin() {
  await connectDB();

  // Check if admin already exists
  const existing = await database.query(
    "SELECT id, email, role FROM users WHERE email = $1",
    [ADMIN_EMAIL]
  );

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    if (user.role === "Admin") {
      console.log(`✅ Admin already exists: ${user.email} (id: ${user.id})`);
      process.exit(0);
    }
    // User exists but is not admin — promote them
    await database.query(
      "UPDATE users SET role = 'Admin', is_verified = TRUE WHERE email = $1",
      [ADMIN_EMAIL]
    );
    console.log(`✅ Promoted existing user to Admin: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  // Create fresh admin user
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const result = await database.query(
    `INSERT INTO users (name, email, password, role, is_verified)
     VALUES ($1, $2, $3, 'Admin', TRUE)
     RETURNING id, name, email, role`,
    [ADMIN_NAME, ADMIN_EMAIL, hashedPassword]
  );

  const admin = result.rows[0];
  console.log("✅ Admin user created successfully:");
  console.log(`   Name  : ${admin.name}`);
  console.log(`   Email : ${admin.email}`);
  console.log(`   Role  : ${admin.role}`);
  console.log(`   ID    : ${admin.id}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
