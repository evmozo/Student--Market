import crypto from "crypto";
import type { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";
import { sendPasswordResetEmail } from "../services/email";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";
import { serializeUser } from "../utils/serializers";

const signToken = (id: string): string => {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign({ id }, env.jwtSecret, options);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, school, course } = req.body as {
    name: string;
    email: string;
    password: string;
    school?: string;
    course?: string;
  };

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({ name, email, password, school, course });
  sendSuccess(res, { user: serializeUser(user), token: signToken(user._id.toString()) }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.accountStatus !== "active") {
    throw new AppError(`Account is ${user.accountStatus}`, 403);
  }

  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, { user: serializeUser(user), token: signToken(user._id.toString()) });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  sendSuccess(res, { user: serializeUser(req.user) });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    sendSuccess(res, { message: "If the account exists, a reset link has been sent." });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.passwordResetExpires = new Date(Date.now() + env.passwordResetMinutes * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetLink = `${env.clientUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetLink);

  sendSuccess(res, {
    message: "If the account exists, a reset link has been sent.",
    resetToken: env.nodeEnv === "production" ? undefined : rawToken
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  }).select("+passwordResetToken +passwordResetExpires +password");

  if (!user) {
    throw new AppError("Reset token is invalid or expired", 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendSuccess(res, { user: serializeUser(user), token: signToken(user._id.toString()) });
});
