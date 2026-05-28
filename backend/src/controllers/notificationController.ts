import type { Request, Response } from "express";
import { Notification } from "../models/Notification";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "name profilePicture school verificationStatus")
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  sendSuccess(res, { notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }
  await notification.populate("sender", "name profilePicture school verificationStatus");
  sendSuccess(res, { notification });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  sendSuccess(res, { message: "All notifications marked as read" });
});
