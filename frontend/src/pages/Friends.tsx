import { Check, MessageCircle, Search, UserPlus, UsersRound, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppSidebar } from "../components/AppSidebar";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FriendButton } from "../components/FriendButton";
import { Skeleton } from "../components/Skeleton";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuthStore } from "../stores/authStore";
import type { FriendRequest, User } from "../types";
import { api, apiData } from "../utils/api";
import { userId } from "../utils/ids";

type Tab = "suggestions" | "requests" | "friends";

const StudentCard = ({ student, onChanged }: { student: User; onChanged?: () => void }) => (
  <article className="rounded-lg border border-white bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
    <div className="flex items-start gap-3">
      <Link to={`/profile/${userId(student)}`}>
        <img
          src={student.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
          alt={student.name}
          className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md ring-2 ring-blue-100"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/profile/${userId(student)}`} className="font-black text-slate-950 hover:underline">
            {student.name}
          </Link>
          <VerifiedBadge user={student} compact />
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-slate-500">{student.school}</p>
        <p className="truncate text-xs text-slate-500">{student.course}</p>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <FriendButton target={student} />
      <Link
        to={`/chats/direct/${userId(student)}`}
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        onClick={onChanged}
      >
        <MessageCircle className="h-4 w-4" />
        Chat
      </Link>
    </div>
  </article>
);

export const Friends = () => {
  const currentUser = useAuthStore((state) => state.user);
  const setCurrentUser = useAuthStore((state) => state.setUser);
  const [tab, setTab] = useState<Tab>("suggestions");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [suggestionsData, friendsData, requestsData] = await Promise.all([
        apiData<{ users: User[] }>(api.get("/users/suggestions/friends")),
        apiData<{ friends: User[] }>(api.get("/friends")),
        apiData<{ requests: FriendRequest[] }>(api.get("/friends/requests"))
      ]);
      setSuggestions(suggestionsData.users.filter((student) => userId(student) !== currentUser?.id));
      setFriends(friendsData.friends);
      setRequests(requestsData.requests);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Friends failed");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const data = await apiData<{ users: User[] }>(api.get("/users", { params: { q: query } }));
        setSearchResults(data.users.filter((student) => userId(student) !== currentUser?.id));
      } catch (requestError) {
        toast.error(requestError instanceof Error ? requestError.message : "Search failed");
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [currentUser?.id, query]);

  const respond = async (from: string | User, status: "accepted" | "rejected") => {
    const fromId = typeof from === "string" ? from : userId(from);
    const data = await apiData<{ user: User }>(api.patch(`/friends/${fromId}/respond`, { status }));
    setCurrentUser(data.user);
    toast.success(status === "accepted" ? "Friend request accepted." : "Friend request rejected.");
    await load();
  };

  const shownStudents = query.trim() ? searchResults : tab === "friends" ? friends : suggestions;

  return (
    <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
        <AppSidebar />
        <div className="min-w-0 space-y-5">
        <section className="overflow-hidden rounded-lg bg-gradient-to-br from-blue-700 via-violet-700 to-fuchsia-600 p-5 text-white shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold ring-1 ring-white/15">
                <UsersRound className="h-4 w-4" />
                Student network
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-normal">Find friends, accept requests, and start chats.</h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-50">
                Verified and unverified students can connect and message. Posting still depends on verification.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/10 p-3 ring-1 ring-white/15"><p className="text-2xl font-black">{friends.length}</p><p className="text-xs font-bold">Friends</p></div>
              <div className="rounded-lg bg-white/10 p-3 ring-1 ring-white/15"><p className="text-2xl font-black">{requests.length}</p><p className="text-xs font-bold">Requests</p></div>
              <div className="rounded-lg bg-white/10 p-3 ring-1 ring-white/15"><p className="text-2xl font-black">{suggestions.length}</p><p className="text-xs font-bold">Suggestions</p></div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-lg p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex gap-2 overflow-x-auto">
              {(["suggestions", "requests", "friends"] as Tab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-md px-4 py-2 text-sm font-black capitalize transition ${
                    tab === item ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20" : "bg-white text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2 rounded-md border border-white bg-white px-3 shadow-sm lg:w-96">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any student" className="w-full py-2 outline-none" />
            </div>
          </div>
        </section>

        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40 w-full" />)}
          </div>
        ) : null}

        {!loading && tab === "requests" && !query.trim() ? (
          requests.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {requests.map((request) => {
                const from = request.from as User;
                const id = typeof request.from === "string" ? request.from : userId(from);
                return (
                  <article key={id} className="rounded-lg border border-white bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {typeof request.from !== "string" ? (
                        <img src={from.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(from.name)}`} alt={from.name} className="h-14 w-14 rounded-full object-cover" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="font-black">{typeof request.from === "string" ? request.from : from.name}</p>
                        {typeof request.from !== "string" ? <p className="truncate text-sm text-slate-500">{from.school}</p> : null}
                      </div>
                      <button onClick={() => respond(request.from, "accepted")} className="rounded-md bg-blue-600 p-2 text-white"><Check className="h-4 w-4" /></button>
                      <button onClick={() => respond(request.from, "rejected")} className="rounded-md bg-slate-100 p-2 text-slate-600"><X className="h-4 w-4" /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <EmptyState title="No friend requests" message="Incoming requests from students will show here." />
        ) : null}

        {!loading && (tab !== "requests" || query.trim()) ? (
          shownStudents.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {shownStudents.map((student) => <StudentCard key={userId(student)} student={student} onChanged={load} />)}
            </div>
          ) : (
            <EmptyState
              title={query.trim() ? "No students found" : tab === "friends" ? "No friends yet" : "No suggestions yet"}
              message={query.trim() ? "Try another name, email, campus, or course." : "Search students and send a friend request."}
            />
          )
        ) : null}

        {!loading && tab === "suggestions" && !query.trim() ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            <UserPlus className="mr-2 inline h-4 w-4" />
            Tip: search works for verified and unverified students, so classmates can chat before verification.
          </div>
        ) : null}
        </div>
      </div>
    </main>
  );
};
