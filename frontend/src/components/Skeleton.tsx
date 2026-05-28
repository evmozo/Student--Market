export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-shimmer rounded-md bg-[linear-gradient(90deg,#e2e8f0_0px,#f8fafc_80px,#e2e8f0_160px)] bg-[length:700px_100%] ${className}`}
  />
);

export const PostCardSkeleton = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex gap-3">
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="mt-4 aspect-[16/10] w-full" />
    <Skeleton className="mt-4 h-5 w-2/3" />
    <Skeleton className="mt-2 h-4 w-full" />
  </div>
);
