import { isAuthenticated } from "../middlewares/authMiddlewares.js";
import express from "express";
import rateLimit from "express-rate-limit";
import {
  getUser,
  login,
  logout,
  register,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

// Fix #7: Rate-limit sensitive auth endpoints to prevent brute-force attacks.
// OTP is only 6 digits (1M combinations) — without limiting, an attacker can
// exhaust the space within minutes.

// Strict limiter for login and OTP verification: 10 attempts per 15 minutes per IP
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

// Looser limiter for registration and forgot-password: 5 per 15 minutes per IP
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again in 15 minutes." },
});

// OTP resend: 3 per 10 minutes to prevent OTP spam
const resendOTPLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP resend requests. Please wait 10 minutes." },
});

router.post("/register", registrationLimiter, register);
router.post("/register/verify-otp", strictAuthLimiter, verifyOTP);
router.post("/register/resend-otp", resendOTPLimiter, resendOTP);
router.post("/login", strictAuthLimiter, login);
router.get("/me", isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);
router.post("/password/forgot", registrationLimiter, forgotPassword);
router.put("/password/reset/:token", strictAuthLimiter, resetPassword);
router.put("/password/update", isAuthenticated, updatePassword);
router.put("/profile/update", isAuthenticated, updateProfile);

export default router;
