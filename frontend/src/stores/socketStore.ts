import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import type { ChatMessage, Conversation, NotificationItem } from "../types";
import { SOCKET_URL } from "../utils/api";
import { useNotificationStore } from "./notificationStore";

interface MessageNewPayload {
  conversationId: string;
  message: ChatMessage;
  conversation: Conversation;
}

interface SocketState {
  socket: Socket | null;
  onlineUserIds: Set<string>;
  connect(token: string): void;
  disconnect(): void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUserIds: new Set<string>(),
  connect(token) {
    if (get().socket?.connected) return;
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"]
    });

    socket.on("connect_error", (error: Error) => toast.error(error.message));
    socket.on("socket:error", (payload: { message: string }) => toast.error(payload.message));
    socket.on("presence:update", (payload: { userId: string; online: boolean }) => {
      set((state) => {
        const next = new Set(state.onlineUserIds);
        if (payload.online) next.add(payload.userId);
        else next.delete(payload.userId);
        return { onlineUserIds: next };
      });
    });
    socket.on("notification:new", (notification: NotificationItem) => {
      useNotificationStore.getState().addNotification(notification);
      toast(notification.message);
    });
    socket.on("message:new", (payload: MessageNewPayload) => {
      toast(payload.message.text ?? "New message received");
    });

    set({ socket });
  },
  disconnect() {
    get().socket?.disconnect();
    set({ socket: null, onlineUserIds: new Set<string>() });
  }
}));
