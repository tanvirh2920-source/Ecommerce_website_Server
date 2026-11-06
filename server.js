import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
import app from "./app.js";

// Fix #13: Provide a sensible PORT fallback so the server never
// listens on an undefined port and becomes silently unreachable.
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});