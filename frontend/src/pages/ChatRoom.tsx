import { ArrowLeft, Info, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AppSidebar } from "../components/AppSidebar";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { MessageBubble } from "../components/MessageBubble";
import { MessageInput, type OutgoingMessage } from "../components/MessageInput";
import { Skeleton } from "../components/Skeleton";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useAuthStore } from "../stores/authStore";
import { useSocketStore } from "../stores/socketStore";
import type { ChatMessage, Conversation, User } from "../types";
import { api, apiData } from "../utils/api";
import { buildConversationId } from "../utils/localConversation";
import { userId } from "../utils/ids";
import { activeLabel } from "../utils/timeFormat";

export const ChatRoom = () => {
  const { conversationId, recipientId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const resolvedConversationId = conversationId ?? (currentUser && recipientId ? buildConversationId(currentUser.id, recipientId) : "");
  const otherUser = useMemo(() => {
    if (recipient) return recipient;
    return conversation?.participants.find((participant) => userId(participant) !== currentUser?.id) ?? null;
  }, [conversation?.participants, currentUser?.id, recipient]);
  const otherUserId = otherUser ? userId(otherUser) : recipientId ?? "";
  const { isTyping, emitTyping } = useTypingIndicator(resolvedConversationId, otherUserId);
  const online = useOnlineStatus(otherUserId || undefined);

  const load = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      if (conversationId) {
        const data = await apiData<{ conversation: Conversation; messages: ChatMessage[] }>(api.get(`/messages/${conversationId}/messages`));
        setConversation(data.conversation);
        setMessages(data.messages);
        await apiData<{ conversationId: string }>(api.post(`/messages/${conversationId}/read`));
      } else if (recipientId) {
        const data = await apiData<{ user: User }>(api.get(`/users/${recipientId}`));
        setRecipient(data.user);
        setMessages([]);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUser, recipientId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket || !resolvedConversationId) return;
    socket.emit("conversation:join", { conversationId: resolvedConversationId });
    const onNew = (payload: { conversationId: string; message: ChatMessage; conversation: Conversation }) => {
      if (payload.conversationId !== resolvedConversationId) return;
      setConversation(payload.conversation);
      setMessages((current) => (current.some((item) => item._id === payload.message._id) ? current : [...current, payload.message]));
      if (!conversationId) navigate(`/chats/${payload.conversationId}`, { replace: true });
    };
    const onUnsent = (payload: { conversationId: string; messageId: string }) => {
      if (payload.conversationId !== resolvedConversationId) return;
      setMessages((current) => current.map((item) => (item._id === payload.messageId ? { ...item, isUnsent: true, text: undefined, mediaUrl: undefined, mediaType: null } : item)));
    };
    socket.on("message:new", onNew);
    socket.on("message:unsent", onUnsent);
    return () => {
      socket.emit("conversation:leave", { conversationId: resolvedConversationId });
      socket.off("message:new", onNew);
      socket.off("message:unsent", onUnsent);
    };
  }, [conversationId, navigate, resolvedConversationId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (outgoing: OutgoingMessage) => {
    const to = recipientId ?? (otherUser ? userId(otherUser) : undefined);
    if (!to) throw new Error("Recipient missing");
    if (socket?.connected) {
      socket.emit("message:send", { recipientId: to, ...outgoing });
      return;
    }
    const data = await apiData<{ conversation: Conversation; message: ChatMessage }>(api.post("/messages", { recipientId: to, ...outgoing }));
    setConversation(data.conversation);
    setMessages((current) => [...current, data.message]);
    navigate(`/chats/${data.conversation.conversationId}`, { replace: true });
  };

  const unsend = async (message: ChatMessage) => {
    if (!resolvedConversationId) return;
    if (socket?.connected) socket.emit("message:unsend", { conversationId: resolvedConversationId, messageId: message._id });
    await apiData<{ conversation: Conversation; message: ChatMessage }>(api.patch(`/messages/${resolvedConversationId}/messages/${message._id}/unsend`));
    setMessages((current) => current.map((item) => (item._id === message._id ? { ...item, isUnsent: true, text: undefined, mediaUrl: undefined, mediaType: null } : item)));
  };

  const removeForMe = async (message: ChatMessage) => {
    await apiData<{ message: string }>(api.patch(`/messages/${resolvedConversationId}/messages/${message._id}/remove`));
    setMessages((current) => current.filter((item) => item._id !== message._id));
  };

  const react = async (message: ChatMessage, emoji: string) => {
    try {
      await apiData<{ conversation: Conversation; message: ChatMessage }>(api.post(`/messages/${resolvedConversationId}/messages/${message._id}/reactions`, { emoji }));
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reaction failed");
    }
  };

  return (
    <main className="soft-grid h-[calc(100vh-73px)] px-0 sm:px-4 sm:py-5">
      <div className="mx-auto grid h-full max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
      <AppSidebar />
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border-white bg-white shadow-soft sm:rounded-lg sm:border">
        <header className="flex items-center gap-3 border-b border-white/60 bg-gradient-to-r from-blue-700 via-violet-700 to-fuchsia-600 p-4 text-white">
          <Link to="/chats" className="rounded-full bg-white/10 p-2 ring-1 ring-white/20 hover:bg-white/20" aria-label="Back to chats"><ArrowLeft className="h-5 w-5" /></Link>
          {otherUser ? (
            <>
              <div className="relative">
                <img src={otherUser.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(otherUser.name)}`} alt={otherUser.name} className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-lg" />
                <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${online ? "bg-emerald-400" : "bg-slate-300"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><p className="truncate font-black">{otherUser.name}</p><VerifiedBadge user={otherUser} compact /></div>
                <p className="text-xs font-semibold text-blue-50">{isTyping ? "Typing..." : activeLabel(otherUser.lastSeen, online)}</p>
              </div>
              <Link to={`/profile/${userId(otherUser)}`} className="hidden rounded-full bg-white/10 p-2 ring-1 ring-white/20 hover:bg-white/20 sm:inline-flex" aria-label="View profile">
                <Info className="h-5 w-5" />
              </Link>
            </>
          ) : <Skeleton className="h-11 w-60" />}
        </header>
        <section className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_22rem),linear-gradient(180deg,#f8fbff,#eef4ff)] p-4">
          {error ? <ErrorState message={error} onRetry={load} /> : null}
          {loading ? Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className={`h-10 ${index % 2 ? "ml-auto w-1/2" : "w-2/3"}`} />) : null}
          {!loading && !error && messages.length === 0 ? (
            <div className="grid h-full min-h-80 place-items-center">
              <EmptyState title="No messages yet" message="Start the conversation with a text, photo, video, or voice note." icon={<MessageCircle className="h-10 w-10" />} />
            </div>
          ) : null}
          {!loading && !error && messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              own={message.sender === currentUser?.id || message.sender === currentUser?._id}
              senderName={message.sender === currentUser?.id || message.sender === currentUser?._id ? currentUser?.name ?? "You" : otherUser?.name ?? "Student"}
              onReply={setReplyingTo}
              onUnsend={unsend}
              onRemove={removeForMe}
              onReact={react}
            />
          ))}
          <div ref={bottomRef} />
        </section>
        <MessageInput disabled={loading || !otherUser} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} onTyping={emitTyping} onSend={send} />
      </div>
      </div>
    </main>
  );
};
