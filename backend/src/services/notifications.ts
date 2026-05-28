import type { Types } from "mongoose";
import { Notification, type NotificationType } from "../models/Notification";

export const createNotification = async (input: {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedPost?: Types.ObjectId;
}) => {
  const notification = await Notification.create(input);
  return notification.populate("sender", "name profilePicture school verificationStatus");
};
