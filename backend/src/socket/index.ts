import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { Message } from "../models/Message";
import type { IUser } from "../models/User";
import { User } from "../models/User";
import { createNotification } from "../services/notifications";
import { appendMessage, type SendMessageInput } from "../services/messages";
import { AppError } from "../utils/http";

interface ServerToClientEvents {
  "message:new": (payload: { conversationId: string; message: unknown; conversation: unknown }) => void;
  "message:read": (payload: { conversationId: string; userId: string; messageIds?: string[] }) => void;
  "message:typing": (payload: { conversationId: string; userId: string; isTyping: boolean }) => void;
  "message:unsent": (payload: { conversationId: string; messageId: string }) => void;
  "notification:new": (payload: unknown) => void;
  "presence:update": (payload: { userId: string; online: boolean; lastSeen?: Date }) => void;
  "socket:error": (payload: { message: string }) => void;
}

interface ClientToServerEvents {
  "conversation:join": (payload: { conversationId: string }) => void;
  "conversation:leave": (payload: { conversationId: string }) => void;
  "message:send": (payload: SendMessageInput) => void;
  "message:read": (payload: { conversationId: string; messageIds?: string[] }) => void;
  "message:typing": (payload: { conversationId: string; recipientId: string; isTyping: boolean }) => void;
  "message:unsend": (payload: { conversationId: string; messageId: string }) => void;
}

type MarketplaceSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  data: { user: IUser };
};

const onlineSockets = new Map<string, Set<string>>();

const addOnline = (userId: string, socketId: string): boolean => {
  const sockets = onlineSockets.get(userId) ?? new Set<string>();
  const wasOffline = sockets.size === 0;
  sockets.add(socketId);
  onlineSockets.set(userId, sockets);
  return wasOffline;
};

const removeOnline = (userId: string, socketId: string): boolean => {
  const sockets = onlineSockets.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineSockets.delete(userId);
    return true;
  }
  return false;
};

const handleSocketError = (socket: MarketplaceSocket, error: unknown): void => {
  const message = error instanceof AppError || error instanceof Error ? error.message : "Socket error";
  socket.emit("socket:error", { message });
};

export const registerSocketServer = (io: Server<ClientToServerEvents, ServerToClientEvents>): void => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (typeof token !== "string") {
        next(new Error("Authentication required"));
        return;
      }
      const payload = jwt.verify(token, env.jwtSecret) as JwtPayload & { id?: string };
      if (!payload.id) {
        next(new Error("Invalid token"));
        return;
      }
      const user = await User.findById(payload.id);
      if (!user || user.accountStatus !== "active") {
        next(new Error("User unavailable"));
        return;
      }
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as MarketplaceSocket;
    const user = socket.data.user;
    const userId = user._id.toString();
    socket.join(`user:${userId}`);
    const becameOnline = addOnline(userId, socket.id);
    if (becameOnline) {
      io.emit("presence:update", { userId, online: true });
    }

    socket.on("conversation:join", ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("message:send", async (payload) => {
      try {
        const { conversation, message } = await appendMessage(user, payload);
        const notification = await createNotification({
          recipient: conversation.participants.find((participant) => participant._id.toString() !== userId)?._id ?? user._id,
          sender: user._id,
          type: "new-message",
          message: `${user.name}: ${message.text ?? "Sent media"}`
        });
        const eventPayload = { conversationId: conversation.conversationId, conversation, message };
        io.to(`conversation:${conversation.conversationId}`).emit("message:new", eventPayload);
        conversation.participants.forEach((participant) => {
          io.to(`user:${participant._id.toString()}`).emit("message:new", eventPayload);
        });
        io.to(`user:${payload.recipientId}`).emit("notification:new", notification);
      } catch (error) {
        handleSocketError(socket, error);
      }
    });

    socket.on("message:typing", ({ conversationId, recipientId, isTyping }) => {
      socket.to(`user:${recipientId}`).emit("message:typing", { conversationId, userId, isTyping });
      socket.to(`conversation:${conversationId}`).emit("message:typing", { conversationId, userId, isTyping });
    });

    socket.on("message:read", async ({ conversationId, messageIds }) => {
      try {
        const conversation = await Message.findOne({ conversationId, participants: user._id });
        if (!conversation) {
          throw new AppError("Conversation not found", 404);
        }
        conversation.messages.forEach((message) => {
          const shouldMark = !messageIds || messageIds.includes(message._id?.toString() ?? "");
          if (shouldMark && !message.readBy.some((reader) => reader.toString() === userId)) {
            message.readBy.push(user._id);
          }
        });
        await conversation.save();
        io.to(`conversation:${conversationId}`).emit("message:read", { conversationId, userId, messageIds });
      } catch (error) {
        handleSocketError(socket, error);
      }
    });

    socket.on("message:unsend", async ({ conversationId, messageId }) => {
      try {
        const conversation = await Message.findOne({ conversationId, participants: user._id });
        const message = conversation?.messages.id(messageId);
        if (!conversation || !message) {
          throw new AppError("Message not found", 404);
        }
        if (message.sender.toString() !== userId) {
          throw new AppError("Only the sender can unsend this message", 403);
        }
        message.text = undefined;
        message.mediaUrl = undefined;
        message.mediaType = null;
        message.isUnsent = true;
        message.unsentAt = new Date();
        await conversation.save();
        io.to(`conversation:${conversationId}`).emit("message:unsent", { conversationId, messageId });
      } catch (error) {
        handleSocketError(socket, error);
      }
    });

    socket.on("disconnect", async () => {
      const becameOffline = removeOnline(userId, socket.id);
      if (becameOffline) {
        user.lastSeen = new Date();
        await user.save({ validateBeforeSave: false });
        io.emit("presence:update", { userId, online: false, lastSeen: user.lastSeen });
      }
    });
  });
};

export const getOnlineUserIds = (): string[] => Array.from(onlineSockets.keys());
