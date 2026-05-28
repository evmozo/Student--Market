import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, MapPin, MessageCircle, Send, Share2, ShoppingBag, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import type { Post, PostReaction, ReactionType, User } from "../types";
import { api, apiData } from "../utils/api";
import { categoryAccent, reactionIcons, reactionLabels } from "../utils/constants";
import { userId } from "../utils/ids";
import { relativeTime } from "../utils/timeFormat";
import { MediaViewer } from "./MediaViewer";
import { VerifiedBadge } from "./VerifiedBadge";

export const PostCard = ({ post, onChange }: { post: Post; onChange: (post: Post) => void }) => {
  const currentUser = useAuthStore((state) => state.user);
  const [imageIndex, setImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [viewer, setViewer] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const counts = useMemo(() => {
    return post.reactions.reduce<Record<ReactionType, number>>(
      (acc, reaction) => ({ ...acc, [reaction.type]: acc[reaction.type] + 1 }),
      { like: 0, love: 0, wow: 0, interested: 0 }
    );
  }, [post.reactions]);

  const myReaction = currentUser
    ? post.reactions.find((reaction) => reactionUserId(reaction) === currentUser.id || reactionUserId(reaction) === currentUser._id)
    : undefined;

  const react = async (type: ReactionType) => {
    if (!currentUser) return;
    try {
      const data = await apiData<{ post: Post }>(api.post(`/posts/${post._id}/reactions`, { type }));
      onChange(data.post);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reaction failed");
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const data = await apiData<{ post: Post }>(api.post(`/posts/${post._id}/comments`, { text: comment.trim() }));
      onChange(data.post);
      setComment("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Comment failed");
    } finally {
      setCommenting(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied.");
      }
      const data = await apiData<{ post: Post }>(api.post(`/posts/${post._id}/share`));
      onChange(data.post);
    } catch {
      toast.error("Share cancelled or unavailable.");
    }
  };

  const updateStatus = async (status: "active" | "sold") => {
    setStatusSaving(true);
    try {
      const data = await apiData<{ post: Post }>(api.patch(`/posts/${post._id}/status`, { status }));
      onChange(data.post);
      toast.success(status === "sold" ? "Marked as sold." : "Post is active again.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update post status");
    } finally {
      setStatusSaving(false);
    }
  };

  const authorId = userId(post.author);
  const hasImages = post.images.length > 0;
  const isOwner = currentUser ? authorId === currentUser.id || authorId === currentUser._id : false;
  const reactionUsers = post.reactions
    .map((reaction) => ({ ...reaction, userObject: reactionUser(reaction) }))
    .filter((reaction): reaction is PostReaction & { userObject: User } => Boolean(reaction.userObject));

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="overflow-hidden rounded-lg border border-white bg-white shadow-soft"
    >
      <div className={`h-1.5 bg-gradient-to-r ${categoryAccent(post.category)}`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${authorId}`}>
            <img
              src={post.author.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(post.author.name)}`}
              alt={post.author.name}
              className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md ring-2 ring-blue-100"
              loading="lazy"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/profile/${authorId}`} className="font-semibold text-slate-950 hover:underline">
                {post.author.name}
              </Link>
              <VerifiedBadge user={post.author} compact />
            </div>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500"><MapPin className="h-3 w-3" /> {relativeTime(post.createdAt)} · {post.location}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-right ring-1 ring-slate-100">
            <p className="text-lg font-black text-slate-950">₱{post.price.toLocaleString()}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black capitalize ${post.type === "sell" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
              <ShoppingBag className="h-3 w-3" />
              {post.type}
            </span>
          </div>
        </div>

        {hasImages ? (
          <div className="relative mt-4 overflow-hidden rounded-lg bg-slate-100 shadow-inner">
            <button type="button" onClick={() => setViewer(post.images[imageIndex])} className="block w-full">
              <img src={post.images[imageIndex]} alt={post.title} className="aspect-[16/10] w-full object-cover transition duration-300 hover:scale-[1.02]" loading="lazy" />
            </button>
            {post.status === "sold" ? (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/45 backdrop-blur-[1px]">
                <span className="rounded-full bg-white px-5 py-2 text-xl font-black uppercase tracking-wide text-red-600 shadow-xl">
                  Sold
                </span>
              </div>
            ) : null}
            <div className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
              {imageIndex + 1}/{post.images.length}
            </div>
            {post.images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setImageIndex((index) => (index === 0 ? post.images.length - 1 : index - 1))}
                  className="absolute left-2 top-1/2 rounded-full bg-white/90 p-1 shadow"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setImageIndex((index) => (index + 1) % post.images.length)}
                  className="absolute right-2 top-1/2 rounded-full bg-white/90 p-1 shadow"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4">
          <h2 className="text-xl font-black tracking-normal text-slate-950">{post.title}</h2>
          <p className={expanded ? "mt-1 text-sm text-slate-600" : "mt-1 text-sm text-slate-600 line-clamp-2"}>{post.description}</p>
          {post.description.length > 120 ? (
            <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 text-sm font-semibold text-blue-700">
              {expanded ? "See less" : "See more"}
            </button>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full bg-gradient-to-r ${categoryAccent(post.category)} px-2.5 py-1 text-xs font-black text-white`}>{post.category}</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">{post.condition}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              <Eye className="h-3 w-3" />
              {post.views} views
            </span>
            {post.status === "sold" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-700 ring-1 ring-red-100">
                <CheckCircle2 className="h-3 w-3" />
                Sold out
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-4">
          {(Object.keys(reactionLabels) as ReactionType[]).map((type) => (
            <motion.button
              key={type}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => react(type)}
              className={`rounded-md px-2 py-2 text-sm font-bold transition hover:bg-white hover:shadow-sm ${
                myReaction?.type === type ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100" : "text-slate-600"
              }`}
            >
              <span className="mr-1">{reactionIcons[type]}</span>
              {counts[type]} {reactionLabels[type]}
            </motion.button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-500">
          <button type="button" className="inline-flex items-center gap-2 hover:text-slate-900">
            <MessageCircle className="h-4 w-4" />
            {post.comments.length} comments
          </button>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={() => setShowReactions(true)} className="inline-flex items-center gap-2 hover:text-slate-900">
              <UsersRound className="h-4 w-4" />
              {post.reactions.length} reactions
            </button>
            <button type="button" onClick={share} className="inline-flex items-center gap-2 hover:text-slate-900">
              <Share2 className="h-4 w-4" />
              {post.shares} shares
            </button>
          </div>
        </div>

        {isOwner && post.type === "sell" ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-slate-700">
                Seller tools: {post.status === "sold" ? "This item is marked sold." : "Mark this item once a buyer gets it."}
              </p>
              <button
                type="button"
                disabled={statusSaving}
                onClick={() => updateStatus(post.status === "sold" ? "active" : "sold")}
                className={`rounded-md px-4 py-2 text-sm font-black text-white shadow-sm disabled:opacity-60 ${
                  post.status === "sold" ? "bg-slate-900 hover:bg-slate-800" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {statusSaving ? "Saving..." : post.status === "sold" ? "Mark active" : "Mark sold"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {post.comments.slice(-3).map((item) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <img src={item.user.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(item.user.name)}`} alt="" className="mt-0.5 h-7 w-7 rounded-full" />
                <p><span className="font-black">{item.user.name}</span> {item.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {currentUser ? (
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a comment"
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
              <button
                type="button"
                disabled={commenting}
                onClick={addComment}
                className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 p-2 text-white shadow-md hover:from-blue-700 hover:to-violet-700 disabled:opacity-60"
                aria-label="Send comment"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <MediaViewer url={viewer} onClose={() => setViewer(null)} />
      {showReactions ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Post reactions</h3>
              <button type="button" onClick={() => setShowReactions(false)} className="rounded-md px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100">
                Close
              </button>
            </div>
            <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
              {reactionUsers.length ? reactionUsers.map((reaction) => (
                <div key={`${userId(reaction.userObject)}-${reaction.type}`} className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                  <img
                    src={reaction.userObject.profilePicture ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(reaction.userObject.name)}`}
                    alt={reaction.userObject.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{reaction.userObject.name}</p>
                    <p className="truncate text-xs text-slate-500">{reaction.userObject.school}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-sm font-black shadow-sm">
                    {reactionIcons[reaction.type]} {reactionLabels[reaction.type]}
                  </span>
                </div>
              )) : (
                <p className="rounded-md bg-slate-50 p-4 text-center text-sm font-semibold text-slate-500">No reactions yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </motion.article>
  );
};

const reactionUserId = (reaction: PostReaction): string =>
  typeof reaction.user === "string" ? reaction.user : userId(reaction.user);

const reactionUser = (reaction: PostReaction): User | null =>
  typeof reaction.user === "string" ? null : reaction.user;
