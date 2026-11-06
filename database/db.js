import pkg from 'pg';
const { Pool } = pkg;

// Fix #1: Use pg.Pool instead of pg.Client for connection pooling.
// A Pool manages multiple connections, handles reconnects automatically,
// and prevents the entire app from dying if a single connection drops.
const database = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required for Render PostgreSQL
      max: 10,                            // max pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "ecommerce_store",
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 5432,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

// Log pool errors so they don't silently crash the process
database.on("error", (err) => {
  console.error("Unexpected database pool error:", err.message);
});

export const connectDB = async () => {
    try {
        // Verify connectivity by acquiring a client from the pool
        const client = await database.connect();
        client.release();
        console.log("Database pool connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

export default database;