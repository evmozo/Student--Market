import { BookOpen, Camera, Check, Edit3, Loader2, MapPin, ShoppingBag, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AppSidebar } from "../components/AppSidebar";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FriendButton } from "../components/FriendButton";
import { PostCard } from "../components/PostCard";
import { Skeleton } from "../components/Skeleton";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuthStore } from "../stores/authStore";
import type { FriendRequest, Post, User } from "../types";
import { api, apiData, uploadFile } from "../utils/api";
import { nemsuCampuses, nemsuCourses } from "../utils/constants";
import { userId } from "../utils/ids";

interface ProfileResponse {
  user: User;
  friends: User[];
  postCount: number;
  friendCount: number;
}

interface EditForm {
  name: string;
  bio: string;
  school: string;
  course: string;
}

export const Profile = () => {
  const { id } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const setCurrentUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [tab, setTab] = useState<"posts" | "friends" | "saved" | "about">("posts");
  const [editing, setEditing] = useState(false);
  const [uploadingField, setUploadingField] = useState<"profilePicture" | "coverPhoto" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<EditForm>();
  const isOwn = currentUser?.id === id || currentUser?._id === id;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [profileData, postsData] = await Promise.all([
        apiData<ProfileResponse>(api.get(`/users/${id}`)),
        apiData<{ posts: Post[] }>(api.get(`/posts/user/${id}`))
      ]);
      setProfile(profileData);
      setPosts(postsData.posts);
      reset({
        name: profileData.user.name,
        bio: profileData.user.bio ?? "",
        school: profileData.user.school ?? "",
        course: profileData.user.course ?? ""
      });
      if (isOwn) {
        const requestData = await apiData<{ requests: FriendRequest[] }>(api.get("/friends/requests"));
        setRequests(requestData.requests);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Profile failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, isOwn]);

  const updatePost = (post: Post) => setPosts((current) => current.map((item) => (item._id === post._id ? post : item)));

  const saveProfile = async (values: EditForm) => {
    const data = await apiData<{ user: User }>(api.patch("/users/me", values));
    setCurrentUser(data.user);
    setProfile((current) => (current ? { ...current, user: data.user } : current));
    setEditing(false);
    toast.success("Profile updated.");
  };

  const uploadProfileImage = async (file: File, field: "profilePicture" | "coverPhoto") => {
    setUploadingField(field);
    try {
      const url = await uploadFile(file, "profiles");
      const data = await apiData<{ user: User }>(api.patch("/users/me", { [field]: url }));
      setCurrentUser(data.user);
      setProfile((current) => (current ? { ...current, user: data.user } : current));
      toast.success(field === "coverPhoto" ? "Cover photo updated." : "Profile picture updated.");
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Image upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const respond = async (from: string | User, status: "accepted" | "rejected") => {
    const idValue = typeof from === "string" ? from : userId(from);
    const data = await apiData<{ user: User }>(api.patch(`/friends/${idValue}/respond`, { status }));
    setCurrentUser(data.user);
    setRequests((current) => current.filter((request) => request.from !== from));
  };

  if (loading) return <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5"><div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]"><AppSidebar /><Skeleton className="h-80 w-full" /></div></main>;
  if (error || !profile) return <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5"><div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]"><AppSidebar /><ErrorState message={error ?? "Profile not found"} onRetry={load} /></div></main>;

  return (
    <main className="soft-grid min-h-[calc(100vh-73px)] px-4 py-5">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
      <AppSidebar />
      <div className="min-w-0">
      <section className="overflow-hidden rounded-lg border border-white bg-white shadow-soft">
        <div className="relative h-56 bg-gradient-to-br from-blue-700 via-violet-700 to-fuchsia-600">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_24%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.18),transparent_28%)]" />
          {profile.user.coverPhoto ? <img src={profile.user.coverPhoto} alt="" className="h-full w-full object-cover" /> : null}
          {isOwn ? (
            <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-lg disabled:opacity-60">
              {uploadingField === "coverPhoto" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <span className="hidden sm:inline">{uploadingField === "coverPhoto" ? "Uploading" : "Cover"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingField !== null}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadProfileImage(file, "coverPhoto");
                }}
              />
            </label>
          ) : null}
        </div>
        <div className="relative px-5 pb-5">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative">
              <Avatar user={profile.user} className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-xl ring-4 ring-blue-100" fallbackClassName="text-3xl" />
              {isOwn ? (
                <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-white p-2 shadow-lg">
                  {uploadingField === "profilePicture" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingField !== null}
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) void uploadProfileImage(file, "profilePicture");
                    }}
                  />
                </label>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-black tracking-normal">{profile.user.name}</h1>
                <VerifiedBadge user={profile.user} />
              </div>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><MapPin className="h-4 w-4" /> {profile.user.school}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><BookOpen className="h-4 w-4" /> {profile.user.course}</p>
              <p className="mt-1 text-sm text-slate-600">{profile.user.bio}</p>
            </div>
            {isOwn ? (
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"><Edit3 className="h-4 w-4" /> Edit</button>
            ) : <FriendButton target={profile.user} />}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-800"><ShoppingBag className="h-5 w-5" /><p className="mt-2 text-2xl font-black">{profile.postCount}</p><p className="text-xs font-bold">Marketplace posts</p></div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-800"><UsersRound className="h-5 w-5" /><p className="mt-2 text-2xl font-black">{profile.friendCount}</p><p className="text-xs font-bold">Student friends</p></div>
            <div className="rounded-lg bg-fuchsia-50 p-3 text-fuchsia-800"><Check className="h-5 w-5" /><p className="mt-2 text-2xl font-black">{profile.user.verificationStatus}</p><p className="text-xs font-bold">Verification status</p></div>
          </div>
        </div>
      </section>

      {isOwn && requests.length ? (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold">Friend requests</h2>
          <div className="mt-3 grid gap-2">
            {requests.map((request) => {
              const from = request.from as User;
              return (
                <div key={typeof request.from === "string" ? request.from : userId(from)} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                  <span className="font-semibold">{typeof request.from === "string" ? request.from : from.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => respond(request.from, "accepted")} className="rounded-md bg-blue-600 p-2 text-white"><Check className="h-4 w-4" /></button>
                    <button onClick={() => respond(request.from, "rejected")} className="rounded-md bg-slate-200 p-2"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="glass-panel mt-5 flex gap-2 overflow-x-auto rounded-lg p-2 shadow-sm">
        {(["posts", "friends", "saved", "about"] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-sm font-bold capitalize transition ${tab === item ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:bg-white"}`}>{item}</button>
        ))}
      </div>

      <section className="mt-5">
        {tab === "posts" && (posts.length ? <div className="grid gap-5">{posts.map((post) => <PostCard key={post._id} post={post} onChange={updatePost} />)}</div> : <EmptyState title="No posts yet" message="Marketplace listings will appear here." />)}
        {tab === "friends" ? (
          profile.friends.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.friends.map((friend) => (
                <Link key={userId(friend)} to={`/profile/${userId(friend)}`} className="rounded-lg border border-white bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-center gap-3">
                    <Avatar user={friend} className="h-12 w-12 rounded-full ring-2 ring-blue-100" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-black">{friend.name}</p>
                        <VerifiedBadge user={friend} compact />
                      </div>
                      <p className="truncate text-xs text-slate-500">{friend.school}</p>
                      <p className="truncate text-xs font-semibold text-slate-400">{friend.course}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title={`${profile.friendCount} friends`} message="Accepted friends will appear here." />
          )
        ) : null}
        {tab === "saved" ? <EmptyState title="No saved posts" message="Saved marketplace posts will appear here." /> : null}
        {tab === "about" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white bg-white p-5 shadow-sm">
              <MapPin className="h-5 w-5 text-blue-600" />
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">Campus</p>
              <p className="mt-1 font-black text-slate-950">{profile.user.school}</p>
            </div>
            <div className="rounded-lg border border-white bg-white p-5 shadow-sm">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">Course</p>
              <p className="mt-1 font-black text-slate-950">{profile.user.course}</p>
            </div>
            <div className="rounded-lg border border-white bg-white p-5 shadow-sm">
              <Check className="h-5 w-5 text-fuchsia-600" />
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">About</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{profile.user.bio || "No bio added yet."}</p>
            </div>
          </div>
        ) : null}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
          <form onSubmit={handleSubmit(saveProfile)} className="w-full max-w-lg rounded-lg bg-white p-5 shadow-soft">
            <h2 className="text-lg font-bold">Edit profile</h2>
            <div className="mt-4 grid gap-3">
              <input {...register("name")} className="rounded-md border border-slate-200 px-3 py-2" />
              <select {...register("school")} className="rounded-md border border-slate-200 px-3 py-2">
                {nemsuCampuses.map((campus) => <option key={campus.value} value={campus.value}>{campus.label}</option>)}
              </select>
              <select {...register("course")} className="rounded-md border border-slate-200 px-3 py-2">
                {nemsuCourses.map((course) => <option key={course} value={course}>{course}</option>)}
              </select>
              <textarea {...register("bio")} maxLength={150} className="rounded-md border border-slate-200 px-3 py-2" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="rounded-md border border-slate-200 px-4 py-2 font-semibold">Cancel</button>
              <button className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white">Save</button>
            </div>
          </form>
        </div>
      ) : null}
      </div>
      </div>
    </main>
  );
};
