import mongoose, { type Document, Schema, type Types } from "mongoose";

export type NotificationType =
  | "friend-request"
  | "friend-accepted"
  | "new-message"
  | "post-reaction"
  | "post-comment"
  | "verification-approved"
  | "verification-rejected";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedPost?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "friend-request",
        "friend-accepted",
        "new-message",
        "post-reaction",
        "post-comment",
        "verification-approved",
        "verification-rejected"
      ],
      required: true
    },
    message: { type: String, required: true, maxlength: 300 },
    relatedPost: { type: Schema.Types.ObjectId, ref: "Post" },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
