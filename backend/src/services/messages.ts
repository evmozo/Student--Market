import { Types } from "mongoose";
import { env } from "../config/env";
import { Message, type MediaType } from "../models/Message";
import type { IUser } from "../models/User";
import { User } from "../models/User";
import { buildConversationId } from "../utils/conversation";
import { AppError } from "../utils/http";

export interface SendMessageInput {
  recipientId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  voiceDuration?: number;
  replyTo?: string;
}

export const ensureCanMessage = async (sender: IUser, recipientId: string): Promise<IUser> => {
  if (sender._id.toString() === recipientId) {
    throw new AppError("You cannot message yourself", 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient || recipient.accountStatus !== "active") {
    throw new AppError("Recipient not found", 404);
  }

  if (env.friendsOnlyMessaging && !sender.friends.some((id) => id.toString() === recipientId)) {
    throw new AppError("You can only message friends", 403);
  }

  return recipient;
};

export const appendMessage = async (sender: IUser, input: SendMessageInput) => {
  await ensureCanMessage(sender, input.recipientId);

  const text = input.text?.trim();
  if (!text && !input.mediaUrl) {
    throw new AppError("Message text or media is required", 422);
  }

  const senderId = sender._id.toString();
  const conversationId = buildConversationId(senderId, input.recipientId);
  const now = new Date();
  const messageId = new Types.ObjectId();
  const conversation = await Message.findOneAndUpdate(
    { conversationId },
    {
      $setOnInsert: {
        conversationId,
        participants: [new Types.ObjectId(senderId), new Types.ObjectId(input.recipientId)]
      },
      $push: {
        messages: {
          _id: messageId,
          sender: sender._id,
          text,
          mediaUrl: input.mediaUrl,
          mediaType: input.mediaType ?? null,
          voiceDuration: input.voiceDuration,
          replyTo: input.replyTo ? new Types.ObjectId(input.replyTo) : undefined,
          isUnsent: false,
          readBy: [sender._id],
          hiddenFor: [],
          reactions: [],
          createdAt: now
        }
      },
      $set: {
        lastMessage: {
          text: text || (input.mediaType ? `Sent ${input.mediaType}` : "Sent media"),
          sender: sender._id,
          createdAt: now,
          isUnsent: false
        }
      }
    },
    { new: true, upsert: true }
  ).populate("participants", "name profilePicture school verificationStatus lastSeen");

  if (!conversation) {
    throw new AppError("Failed to create message", 500);
  }

  const message = conversation.messages.id(messageId);
  if (!message) {
    throw new AppError("Failed to append message", 500);
  }

  return { conversation, message };
};
