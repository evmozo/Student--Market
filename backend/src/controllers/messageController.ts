import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Message } from "../models/Message";
import { createNotification } from "../services/notifications";
import { appendMessage } from "../services/messages";
import { AppError, asyncHandler, sendSuccess } from "../utils/http";

const requireCurrentUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
};

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const q = String(req.query.q ?? "").trim();
  const conversations = await Message.find({ participants: currentUser._id })
    .populate("participants", "name profilePicture school verificationStatus lastSeen")
    .populate("lastMessage.sender", "name")
    .sort({ updatedAt: -1 })
    .limit(50);

  const filtered = q
    ? conversations.filter((conversation) =>
        conversation.participants.some((participant) => {
          if (!("name" in participant)) return false;
          return String(participant.name).toLowerCase().includes(q.toLowerCase());
        })
      )
    : conversations;

  sendSuccess(res, { conversations: filtered });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const conversation = await Message.findOne({
    conversationId: req.params.conversationId,
    participants: currentUser._id
  }).populate("participants", "name profilePicture school verificationStatus lastSeen");

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  sendSuccess(res, { conversation });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 30), 1), 50);

  const conversation = await Message.findOne({
    conversationId: req.params.conversationId,
    participants: currentUser._id
  }).populate("participants", "name profilePicture school verificationStatus lastSeen");
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  const visibleMessages = conversation.messages
    .filter((message) => !message.hiddenFor.some((id) => id.toString() === currentUser._id.toString()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const slice = visibleMessages.slice((page - 1) * limit, page * limit).reverse();

  sendSuccess(res, {
    conversation,
    messages: slice,
    page,
    hasMore: page * limit < visibleMessages.length
  });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const { conversation, message } = await appendMessage(currentUser, req.body);
  const recipientId = req.body.recipientId as string;

  await createNotification({
    recipient: new Types.ObjectId(recipientId),
    sender: currentUser._id,
    type: "new-message",
    message: `${currentUser.name}: ${message.text ?? "Sent media"}`
  });

  sendSuccess(res, { conversation, message }, 201);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const conversation = await Message.findOne({
    conversationId: req.params.conversationId,
    participants: currentUser._id
  });
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  conversation.messages.forEach((message) => {
    if (!message.readBy.some((id) => id.toString() === currentUser._id.toString())) {
      message.readBy.push(currentUser._id);
    }
  });
  await conversation.save();
  sendSuccess(res, { conversationId: conversation.conversationId });
});

export const unsendMessage = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const conversation = await Message.findOne({
    conversationId: req.params.conversationId,
    participants: currentUser._id
  });
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }
  const message = conversation.messages.id(req.params.messageId);
  if (!message) {
    throw new AppError("Message not found", 404);
  }
  if (message.sender.toString() !== currentUser._id.toString()) {
    throw new AppError("Only the sender can unsend this message", 403);
  }

  message.text = undefined;
  message.mediaUrl = undefined;
  message.mediaType = null;
  message.isUnsent = true;
  message.unsentAt = new Date();

  const last = conversation.messages[conversation.messages.length - 1];
  if (last?._id?.toString() === message._id?.toString()) {
    conversation.lastMessage = {
      text: `${currentUser.name} unsent a message`,
      sender: currentUser._id,
      createdAt: new Date(),
      isUnsent: true
    };
  }
  await conversation.save();
  sendSuccess(res, { conversation, message });
});

export const removeMessageForMe = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const conversation = await Message.findOne({
    conversationId: req.params.conversationId,
    participants: currentUser._id
  });
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }
  const message = conversation.messages.id(req.params.messageId);
  if (!message) {
    throw new AppError("Message not found", 404);
  }
  if (!message.hiddenFor.some((id) => id.toString() === currentUser._id.toString())) {
    message.hiddenFor.push(currentUser._id);
  }
  await conversation.save();
  sendSuccess(res, { message: "Removed for you" });
});

export const reactToMessage = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireCurrentUser(req);
  const { emoji } = req.body as { emoji: string };
  const conversation = await Message.findOne({
    conversationId: req.params.conversationId,
    participants: currentUser._id
  });
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }
  const message = conversation.messages.id(req.params.messageId);
  if (!message) {
    throw new AppError("Message not found", 404);
  }
  const index = message.reactions.findIndex((reaction) => reaction.user.toString() === currentUser._id.toString());
  if (index >= 0 && message.reactions[index].emoji === emoji) {
    message.reactions.splice(index, 1);
  } else if (index >= 0) {
    message.reactions[index].emoji = emoji;
  } else {
    message.reactions.push({ user: currentUser._id, emoji });
  }
  await conversation.save();
  sendSuccess(res, { conversation, message });
});
