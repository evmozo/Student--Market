import { MessageCircle, Search, Send, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuthStore } from "../stores/authStore";
import type { Conversation, User } from "../types";
import { api, apiData } from "../utils/api";
import { userId } from "../utils/ids";
import { chatTime } from "../utils/timeFormat";

export const ChatList = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiData<{ conversations: Conversation[] }>(api.get("/messages", { params: { q: query } }));
        setConversations(data.conversations);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Chats failed");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [query]);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }
      const data = await apiData<{ users: User[] }>(api.get("/users", { params: { q: query } }));
      setUsers(data.users.filter((user) => userId(user) !== currentUser?.id && userId(user) !== currentUser?._id));
    }, 300);
    return () => window.clearTimeout(id);
  }, [currentUser?.id, currentUser?._id, query]);

  return (
    <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_320px_minmax(0,1fr)]">
        <AppSidebar />
        <aside className="space-y-4">
          <section className="overflow-hidden rounded-lg bg-gradient-to-br from-blue-700 via-violet-700 to-fuchsia-600 p-5 text-white shadow-soft">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide ring-1 ring-white/15">
              <Sparkles className="h-4 w-4" />
              Messenger
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-normal">Student chats</h1>
            <p className="mt-2 text-sm font-medium text-blue-50">
              Send texts, images, videos, and voice notes to classmates.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/10 p-3 ring-1 ring-white/15">
                <MessageCircle className="h-5 w-5" />
                <p className="mt-2 text-2xl font-black">{conversations.length}</p>
                <p className="text-xs font-bold text-blue-50">Chats</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3 ring-1 ring-white/15">
                <UsersRound className="h-5 w-5" />
                <p className="mt-2 text-2xl font-black">{users.length}</p>
                <p className="text-xs font-bold text-blue-50">Found</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-lg p-4 shadow-sm">
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Search students or chats</label>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-white bg-white px-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, campus, or course"
                className="w-full py-2 outline-none"
              />
            </div>
          </section>
        </aside>

        <section className="overflow-hidden rounded-lg border border-white bg-white/90 shadow-soft backdrop-blur">
          <div className="border-b border-slate-100 bg-white p-4">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Recent conversations
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Sorted by the latest message.</p>
          </div>
          {error ? <div className="p-4"><ErrorState message={error} /></div> : null}
          {users.length ? (
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-fuchsia-50 to-amber-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Start a chat</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {users.map((user) => (
                  <Link key={userId(user)} to={`/chats/direct/${userId(user)}`} className="flex items-center gap-3 rounded-lg bg-white/85 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <img src={user.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name)}`} alt={user.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-white" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black">{user.name}</p>
                      <VerifiedBadge user={user} compact />
                    </div>
                    <Send className="h-4 w-4 text-blue-600" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="divide-y divide-slate-100">
            {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="p-4"><Skeleton className="h-16 w-full" /></div>) : null}
            {!loading && conversations.length === 0 ? <div className="p-4"><EmptyState title="No conversations" message="Search any student to start chatting." /></div> : null}
            {conversations.map((conversation) => {
              const other = conversation.participants.find((participant) => userId(participant) !== currentUser?.id) ?? conversation.participants[0];
              return (
                <Link key={conversation.conversationId} to={`/chats/${conversation.conversationId}`} className="flex items-center gap-3 p-4 transition hover:bg-blue-50/70">
                  <div className="relative">
                    <img src={other.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(other.name)}`} alt={other.name} className="h-14 w-14 rounded-full object-cover shadow-sm ring-2 ring-white" />
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-black">{other.name}</p>
                      <VerifiedBadge user={other} compact />
                    </div>
                    <p className="truncate text-sm font-semibold text-slate-500">{conversation.lastMessage?.isUnsent ? "Message unsent" : conversation.lastMessage?.text ?? "Media message"}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{chatTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};
