import { create } from "zustand";
import type { NotificationItem } from "../types";
import { api, apiData } from "../utils/api";

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications(): Promise<void>;
  addNotification(notification: NotificationItem): void;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  async fetchNotifications() {
    set({ loading: true });
    try {
      const data = await apiData<{ notifications: NotificationItem[]; unreadCount: number }>(api.get("/notifications"));
      set({ items: data.notifications, unreadCount: data.unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addNotification(notification) {
    set((state) => ({
      items: [notification, ...state.items.filter((item) => item._id !== notification._id)]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50),
      unreadCount: state.items.some((item) => item._id === notification._id)
        ? state.unreadCount
        : state.unreadCount + (notification.isRead ? 0 : 1)
    }));
  },
  async markRead(id) {
    const wasUnread = get().items.some((item) => item._id === id && !item.isRead);
    const data = await apiData<{ notification: NotificationItem }>(api.patch(`/notifications/${id}/read`));
    set((state) => ({
      items: state.items.map((item) => (item._id === id ? { ...item, ...data.notification, isRead: true } : item)),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
    }));
  },
  async markAllRead() {
    await apiData<{ message: string }>(api.patch("/notifications/read-all"));
    set({ items: get().items.map((item) => ({ ...item, isRead: true })), unreadCount: 0 });
  }
}));
