import { Router } from "express";
import { body } from "express-validator";
import { forgotPassword, getMe, login, register, resetPassword } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { loginRateLimit } from "../middleware/rateLimit";
import { validate } from "../utils/validation";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8, max: 128 }),
    body("school").optional().trim().isLength({ max: 120 }),
    body("course").optional().trim().isLength({ max: 120 })
  ],
  validate,
  register
);

authRoutes.post(
  "/login",
  loginRateLimit,
  [body("email").isEmail().normalizeEmail(), body("password").isString().notEmpty()],
  validate,
  login
);

authRoutes.get("/me", authenticate, getMe);

authRoutes.post("/forgot-password", [body("email").isEmail().normalizeEmail()], validate, forgotPassword);

authRoutes.post(
  "/reset-password",
  [body("token").isString().isLength({ min: 32 }), body("password").isLength({ min: 8, max: 128 })],
  validate,
  resetPassword
);
