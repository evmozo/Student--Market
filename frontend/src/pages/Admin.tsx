import { Check, Eye, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "../components/AppSidebar";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { VerifiedBadge } from "../components/VerifiedBadge";
import type { Post, User } from "../types";
import { api, apiData } from "../utils/api";

interface Stats {
  totalUsers: number;
  verified: number;
  pending: number;
  posts: number;
  messages: number;
}

export const Admin = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<User | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, queueData, usersData, postsData] = await Promise.all([
        apiData<Stats>(api.get("/admin/stats")),
        apiData<{ users: User[] }>(api.get("/verification/queue")),
        apiData<{ users: User[] }>(api.get("/admin/users")),
        apiData<{ posts: Post[] }>(api.get("/admin/posts"))
      ]);
      setStats(statsData);
      setQueue(queueData.users);
      setUsers(usersData.users);
      setPosts(postsData.posts);
      setReviewing((current) => current ? queueData.users.find((user) => user.id === current.id || user._id === current._id) ?? null : null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Admin failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approve = async (id: string) => {
    setSavingId(id);
    try {
      await apiData<{ user: User }>(api.patch(`/verification/${id}/approve`));
      toast.success("Student verified. They can now create buy/sell posts.");
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Approve failed");
    } finally {
      setSavingId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = reasons[id]?.trim() ?? "";
    if (reason.length < 3) {
      toast.error("Add a rejection reason.");
      return;
    }
    setSavingId(id);
    try {
      await apiData<{ user: User }>(api.patch(`/verification/${id}/reject`, { reason }));
      setReasons((current) => ({ ...current, [id]: "" }));
      toast.success("Verification rejected.");
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Reject failed");
    } finally {
      setSavingId(null);
    }
  };

  const updateUserStatus = async (id: string, accountStatus: User["accountStatus"]) => {
    await apiData<{ user: User }>(api.patch(`/admin/users/${id}`, { accountStatus }));
    await load();
  };

  const updatePostStatus = async (id: string, status: Post["status"]) => {
    await apiData<{ post: Post }>(api.patch(`/admin/posts/${id}`, { status }));
    await load();
  };

  const deletePost = async (id: string) => {
    await apiData<{ message: string }>(api.delete(`/admin/posts/${id}`));
    setPosts((current) => current.filter((post) => post._id !== id));
  };

  if (loading) {
    return <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5"><div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]"><AppSidebar /><Skeleton className="h-96 w-full" /></div></main>;
  }
  if (error) {
    return <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5"><div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]"><AppSidebar /><ErrorState message={error} onRetry={load} /></div></main>;
  }

  return (
    <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
        <AppSidebar />
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-lg border border-white bg-white shadow-soft">
            <div className="bg-gradient-to-r from-blue-700 to-sky-500 p-5 text-white">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-normal">Review student verification requests.</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-blue-50">
                Approve COR or School ID submissions so students can create buy/sell marketplace posts.
              </p>
            </div>
            {stats ? (
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-black capitalize text-slate-500">{key}</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-white bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">Verification Queue</h2>
                <p className="text-sm font-semibold text-slate-500">Pending COR or School ID uploads.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">{queue.length} pending</span>
            </div>
            {queue.length === 0 ? <div className="mt-3"><EmptyState title="Queue clear" message="No pending verification documents." /></div> : null}
            <div className="mt-4 grid gap-3">
              {queue.map((user) => {
                const id = user.id ?? user._id ?? "";
                return (
                  <article key={id} className="grid gap-4 rounded-lg border border-slate-200 p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} className="h-12 w-12 rounded-full ring-2 ring-blue-100" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-black text-slate-950">{user.name}</p>
                            <VerifiedBadge user={user} />
                          </div>
                          <p className="truncate text-sm font-semibold text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <p className="rounded-md bg-slate-50 px-3 py-2"><b>Campus:</b> {user.school}</p>
                        <p className="rounded-md bg-slate-50 px-3 py-2"><b>Course:</b> {user.course}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.verificationDocument ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setReviewing(user)}
                              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-black text-white hover:bg-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                              Preview document
                            </button>
                            <a href={user.verificationDocument} target="_blank" rel="noreferrer" className="rounded-md border border-blue-200 px-3 py-2 text-sm font-black text-blue-700 hover:bg-blue-50">
                              Open in new tab
                            </a>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => approve(id)}
                        disabled={savingId === id}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />
                        Approve and verify
                      </button>
                      <textarea
                        value={reasons[id] ?? ""}
                        onChange={(event) => setReasons((current) => ({ ...current, [id]: event.target.value }))}
                        placeholder="Rejection reason, e.g. blurry COR or wrong ID"
                        rows={3}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => reject(id)}
                        disabled={savingId === id}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-300 px-3 py-2 font-black text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Reject submission
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-white bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black">Users</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="p-3">User</th><th>Status</th><th>Verification</th><th>Role</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} className="h-10 w-10 rounded-full" />
                          <div><b>{user.name}</b><br /><span className="text-slate-500">{user.email}</span></div>
                        </div>
                      </td>
                      <td>{user.accountStatus}</td>
                      <td>{user.verificationStatus}</td>
                      <td>{user.role}</td>
                      <td className="space-x-2">
                        <button onClick={() => updateUserStatus(user.id, "suspended")} className="rounded-md border border-slate-200 px-2 py-1">Suspend</button>
                        <button onClick={() => updateUserStatus(user.id, "banned")} className="rounded-md border border-red-200 px-2 py-1 text-red-700">Ban</button>
                        <button onClick={() => updateUserStatus(user.id, "active")} className="rounded-md border border-emerald-200 px-2 py-1 text-emerald-700">Activate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-white bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black">Posts</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="p-3">Post</th><th>Author</th><th>Status</th><th>Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id} className="border-t border-slate-100">
                      <td className="p-3"><b>{post.title}</b><br /><span className="text-slate-500">{post.category}</span></td>
                      <td>{post.author.name}</td>
                      <td>{post.status}</td>
                      <td>₱{post.price.toLocaleString()}</td>
                      <td className="space-x-2">
                        <button onClick={() => updatePostStatus(post._id, "sold")} className="rounded-md border border-slate-200 px-2 py-1">Sold</button>
                        <button onClick={() => updatePostStatus(post._id, "archived")} className="rounded-md border border-slate-200 px-2 py-1">Archive</button>
                        <button onClick={() => deletePost(post._id)} className="rounded-md border border-red-200 p-1.5 text-red-700" aria-label="Delete post"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {reviewing?.verificationDocument ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <p className="font-black text-slate-950">{reviewing.name}</p>
                <p className="text-sm font-semibold text-slate-500">Submitted COR / School ID</p>
              </div>
              <button type="button" onClick={() => setReviewing(null)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close document preview">
                <X className="h-5 w-5" />
              </button>
            </div>
            <DocumentPreview url={reviewing.verificationDocument} />
          </div>
        </div>
      ) : null}
    </main>
  );
};

const DocumentPreview = ({ url }: { url: string }) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(cleanUrl);

  if (isImage) {
    return (
      <div className="overflow-auto bg-slate-100 p-4">
        <img src={url} alt="Verification document" className="mx-auto max-h-[75vh] rounded-md object-contain shadow-lg" />
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title="Verification document"
      className="h-[75vh] w-full bg-slate-100"
    />
  );
};
