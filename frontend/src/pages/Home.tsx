import { motion } from "framer-motion";
import {
  BookOpen,
  MapPin,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppSidebar } from "../components/AppSidebar";
import { Avatar } from "../components/Avatar";
import { CreatePost } from "../components/CreatePost";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PostCard } from "../components/PostCard";
import { PostCardSkeleton } from "../components/Skeleton";
import { VerificationBanner } from "../components/VerificationBanner";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuthStore } from "../stores/authStore";
import type { Post, PostCategory, PostType } from "../types";
import { api, apiData } from "../utils/api";
import { categories, nemsuCampuses } from "../utils/constants";

type SortKey = "newest" | "oldest" | "price-asc" | "price-desc" | "popular";

export const Home = () => {
  const user = useAuthStore((state) => state.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<PostCategory | "all">("all");
  const [type, setType] = useState<PostType | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const query = useMemo(
    () => ({ category, type, sort, search: debouncedSearch }),
    [category, debouncedSearch, sort, type]
  );

  const fetchPosts = useCallback(
    async (targetPage: number, replace = false) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiData<{ posts: Post[]; hasMore: boolean; page: number }>(
          api.get("/posts", { params: { ...query, page: targetPage, limit: 8 } })
        );
        setPosts((current) => (replace ? data.posts : [...current, ...data.posts]));
        setHasMore(data.hasMore);
        setPage(data.page);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Feed failed");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    void fetchPosts(1, true);
  }, [fetchPosts]);

  const sentinelRef = useInfiniteScroll(() => {
    if (!loading && hasMore) void fetchPosts(page + 1);
  }, hasMore);

  const updatePost = (post: Post) => {
    setPosts((current) => current.map((item) => (item._id === post._id ? post : item)));
  };

  const onCreated = (post: Post) => {
    setPosts((current) => [post, ...current]);
  };

  const refresh = async () => {
    await fetchPosts(1, true);
    toast.success("Feed refreshed.");
  };

  const userProfileId = user?.id ?? user?._id;
  const postCountLabel = posts.length ? posts.length.toString() : "0";

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f0f4fb]">
      <div className="mx-auto grid max-w-[1440px] gap-5 px-3 py-4 lg:grid-cols-[270px_minmax(0,680px)_320px] xl:px-5">
        <AppSidebar />

        <section className="min-w-0 space-y-4">
          <div className="rounded-lg border border-white bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar user={user} name={user?.name ?? "NEMSU"} src={user ? undefined : "/logo.jpeg"} className="h-11 w-11 rounded-full ring-2 ring-blue-100" />
              {user?.verificationStatus === "verified" ? (
                <CreatePost onCreated={onCreated} variant="inline" />
              ) : (
                <Link
                  to={userProfileId ? `/profile/${userProfileId}` : "/"}
                  className="flex min-h-12 flex-1 items-center rounded-full bg-slate-100 px-4 font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Verify your student account to create marketplace posts.
                </Link>
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-sm font-black text-slate-600">
              <button type="button" onClick={() => setType("sell")} className="rounded-md py-2 hover:bg-blue-50 hover:text-blue-700">
                Sell item
              </button>
              <button type="button" onClick={() => setType("buy")} className="rounded-md py-2 hover:bg-blue-50 hover:text-blue-700">
                Looking for
              </button>
              <button type="button" onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-md py-2 hover:bg-blue-50 hover:text-blue-700">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <VerificationBanner />

          <div className="overflow-hidden rounded-lg border border-white bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">Browse categories</p>
                <p className="text-xs font-semibold text-slate-500">Filter marketplace posts by item type.</p>
              </div>
              <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 sm:inline-flex">
                {postCountLabel} shown
              </span>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                    category === item.value
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-600/20`
                      : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:hidden">
            <label className="flex items-center gap-2 rounded-full border border-white bg-white px-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search marketplace"
                className="w-full bg-transparent py-3 outline-none"
              />
            </label>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="rounded-md border border-white bg-white px-3 py-3 font-semibold shadow-sm">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price ASC</option>
              <option value="price-desc">Price DESC</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {error ? <ErrorState message={error} onRetry={() => fetchPosts(1, true)} /> : null}
          {!error && !loading && posts.length === 0 ? <EmptyState title="No marketplace posts" message="Try another filter or create the first listing after verification." /> : null}
          <motion.div layout className="grid gap-4">
            {posts.map((post) => <PostCard key={post._id} post={post} onChange={updatePost} />)}
            {loading ? Array.from({ length: posts.length ? 2 : 4 }).map((_, index) => <PostCardSkeleton key={index} />) : null}
            <div ref={sentinelRef} />
          </motion.div>
        </section>

        <aside className="hidden h-fit space-y-4 lg:sticky lg:top-20 lg:block">
          <section className="overflow-hidden rounded-lg border border-white bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-700 to-sky-500 p-4 text-white">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wide">
                <Sparkles className="h-4 w-4" />
                NEMSU Market
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-normal">Campus deals, student verified.</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3 text-center">
              <Metric label="Posts" value={postCountLabel} />
              <Metric label="Campuses" value="8" />
              <Metric label="Chat" value="Live" />
            </div>
          </section>

          <section className="rounded-lg border border-white bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 font-black text-slate-950">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Trending now
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <Trend label="IT students buying laptops" tone="blue" />
              <Trend label="Uniform swaps before Monday" tone="sky" />
              <Trend label="Dorm furniture deals" tone="emerald" />
            </div>
          </section>

          <section className="rounded-lg border border-white bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 font-black text-slate-950">
              <MapPin className="h-5 w-5 text-blue-600" />
              Campus branches
            </div>
            <div className="mt-3 space-y-3">
              {nemsuCampuses.slice(0, 5).map((campus) => (
                <div key={campus.value} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-black text-slate-950">{campus.label}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{campus.focus}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 font-black text-slate-950">
              <BookOpen className="h-5 w-5 text-sky-600" />
              Demo checklist
            </div>
            <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <p className="rounded-md bg-blue-50 px-3 py-2 text-blue-700">Open a post and react</p>
              <p className="rounded-md bg-sky-50 px-3 py-2 text-sky-700">View who reacted</p>
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">Message a student seller</p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xl font-black text-slate-950">{value}</p>
    <p className="text-xs font-bold text-slate-500">{label}</p>
  </div>
);

const Trend = ({ label, tone }: { label: string; tone: "blue" | "sky" | "emerald" }) => {
  const classes = {
    blue: "bg-blue-50 text-blue-700",
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700"
  };
  return (
    <p className={`rounded-md px-3 py-2 font-bold ${classes[tone]}`}>
      <ShoppingBag className="mr-2 inline h-4 w-4" />
      {label}
    </p>
  );
};
