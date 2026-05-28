import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserPlus
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { NotificationItem } from "../types";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { relativeTime } from "../utils/timeFormat";
import { Avatar } from "./Avatar";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const { items, unreadCount, loading, fetchNotifications, markAllRead, markRead } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
    const id = window.setInterval(() => {
      void fetchNotifications();
    }, 30000);
    return () => window.clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    if (open) void fetchNotifications();
  }, [fetchNotifications, open]);

  const unreadItems = useMemo(() => items.filter((item) => !item.isRead), [items]);
  const readItems = useMemo(() => items.filter((item) => item.isRead), [items]);

  const onClickNotification = async (item: NotificationItem) => {
    if (!item.isRead) await markRead(item._id);
    setOpen(false);
    navigate(notificationTarget(item, user?.id ?? user?._id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 ${unreadCount > 0 ? "animate-bell" : ""}`}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 z-30 mt-2 w-[min(92vw,420px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-950">Notifications</p>
                <p className="text-xs font-medium text-slate-500">
                  {loading ? "Updating..." : unreadCount ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void markAllRead()}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400"
                aria-label="Mark all read"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <Bell className="h-6 w-6" />
                  </span>
                  <p className="mt-3 font-semibold text-slate-900">No notifications yet</p>
                  <p className="mt-1 text-sm text-slate-500">Messages, reactions, comments, and verification updates will show here.</p>
                </div>
              ) : (
                <>
                  {unreadItems.length ? (
                    <NotificationGroup title="Unread">
                      {unreadItems.map((item) => (
                        <NotificationRow key={item._id} item={item} onClick={() => void onClickNotification(item)} />
                      ))}
                    </NotificationGroup>
                  ) : null}
                  {readItems.length ? (
                    <NotificationGroup title={unreadItems.length ? "Earlier" : "Recent"}>
                      {readItems.map((item) => (
                        <NotificationRow key={item._id} item={item} onClick={() => void onClickNotification(item)} />
                      ))}
                    </NotificationGroup>
                  ) : null}
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const NotificationGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="py-1">
    <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
    <div className="space-y-1">{children}</div>
  </section>
);

const NotificationRow = ({ item, onClick }: { item: NotificationItem; onClick: () => void }) => {
  const meta = notificationMeta(item.type);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50 ${
        item.isRead ? "bg-white" : "bg-blue-50/80"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar user={item.sender} name={meta.systemName} src={item.sender ? undefined : "/logo.jpeg"} className="h-11 w-11 rounded-full ring-2 ring-white" />
        <span className={`absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full text-white ring-2 ring-white ${meta.color}`}>
          {meta.icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{item.message}</p>
          {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" /> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.pill}`}>{meta.label}</span>
          <span className="text-xs font-medium text-slate-500">{relativeTime(item.createdAt)}</span>
        </div>
      </div>
    </button>
  );
};

const notificationMeta = (type: NotificationItem["type"]) => {
  switch (type) {
    case "friend-request":
      return {
        label: "Friend request",
        systemName: "Friend request",
        color: "bg-emerald-600",
        pill: "bg-emerald-50 text-emerald-700",
        icon: <UserPlus className="h-3.5 w-3.5" />
      };
    case "friend-accepted":
      return {
        label: "Friend accepted",
        systemName: "Friend accepted",
        color: "bg-blue-600",
        pill: "bg-blue-50 text-blue-700",
        icon: <UserCheck className="h-3.5 w-3.5" />
      };
    case "new-message":
      return {
        label: "Message",
        systemName: "Message",
        color: "bg-violet-600",
        pill: "bg-violet-50 text-violet-700",
        icon: <MessageCircle className="h-3.5 w-3.5" />
      };
    case "post-reaction":
      return {
        label: "Reaction",
        systemName: "Post reaction",
        color: "bg-rose-600",
        pill: "bg-rose-50 text-rose-700",
        icon: <Heart className="h-3.5 w-3.5" />
      };
    case "post-comment":
      return {
        label: "Comment",
        systemName: "Post comment",
        color: "bg-sky-600",
        pill: "bg-sky-50 text-sky-700",
        icon: <MessageSquare className="h-3.5 w-3.5" />
      };
    case "verification-approved":
      return {
        label: "Verified",
        systemName: "NEMSU Market",
        color: "bg-blue-600",
        pill: "bg-blue-50 text-blue-700",
        icon: <ShieldCheck className="h-3.5 w-3.5" />
      };
    case "verification-rejected":
      return {
        label: "Rejected",
        systemName: "NEMSU Market",
        color: "bg-red-600",
        pill: "bg-red-50 text-red-700",
        icon: <ShieldX className="h-3.5 w-3.5" />
      };
  }
};

const notificationTarget = (item: NotificationItem, currentUserId?: string): string => {
  switch (item.type) {
    case "friend-request":
    case "friend-accepted":
      return "/friends";
    case "new-message":
      return "/chats";
    case "verification-approved":
    case "verification-rejected":
      return currentUserId ? `/profile/${currentUserId}` : "/";
    case "post-reaction":
    case "post-comment":
    default:
      return "/";
  }
};
