import type { Request, Response } from "express";
import { User } from "../models/User";
import { createNotification } from "../services/notifications";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";
import { serializeUser } from "../utils/serializers";

export const submitVerification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const { verificationDocument } = req.body as { verificationDocument: string };
  req.user.verificationDocument = verificationDocument;
  req.user.verificationStatus = "pending";
  req.user.verificationSubmittedAt = new Date();
  req.user.verificationRejectionReason = undefined;
  await req.user.save();
  sendSuccess(res, { user: serializeUser(req.user) });
});

export const verificationQueue = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find({ verificationStatus: "pending" }).sort({ verificationSubmittedAt: 1 });
  sendSuccess(res, { users: users.map(serializeUser) });
});

export const approveVerification = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  user.verificationStatus = "verified";
  user.verificationReviewedAt = new Date();
  user.verificationRejectionReason = undefined;
  await user.save();
  await createNotification({
    recipient: user._id,
    type: "verification-approved",
    message: "Your student verification was approved"
  });
  sendSuccess(res, { user: serializeUser(user) });
});

export const rejectVerification = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason: string };
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  user.verificationStatus = "rejected";
  user.verificationReviewedAt = new Date();
  user.verificationRejectionReason = reason;
  await user.save();
  await createNotification({
    recipient: user._id,
    type: "verification-rejected",
    message: `Your student verification was rejected: ${reason}`
  });
  sendSuccess(res, { user: serializeUser(user) });
});
