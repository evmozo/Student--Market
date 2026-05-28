import { UserCheck, UserPlus, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import type { User } from "../types";
import { api, apiData } from "../utils/api";
import { userId } from "../utils/ids";

export const FriendButton = ({ target }: { target: User }) => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const targetId = userId(target);
  const isSelf = user?.id === targetId;
  const isFriend = useMemo(() => Boolean(user?.friends.includes(targetId)), [targetId, user?.friends]);
  const hasPendingRequest = requested || Boolean(target.friendRequests?.some((request) => request.status === "pending" && request.from === user?.id));

  if (!user || isSelf) return null;

  const sendRequest = async () => {
    setLoading(true);
    try {
      await apiData<{ message: string }>(api.post(`/friends/${targetId}/request`));
      setRequested(true);
      toast.success("Friend request sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send request");
    } finally {
      setLoading(false);
    }
  };

  const unfriend = async () => {
    setLoading(true);
    try {
      const data = await apiData<{ user: User }>(api.delete(`/friends/${targetId}`));
      setUser(data.user);
      setRequested(false);
      toast.success("Removed friend.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not unfriend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading || (!isFriend && hasPendingRequest)}
      title={hasPendingRequest ? "Friend request already sent" : undefined}
      onClick={isFriend ? unfriend : sendRequest}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
        isFriend
          ? "border border-slate-300 text-slate-700 hover:bg-slate-100"
          : hasPendingRequest
            ? "bg-amber-100 text-amber-800"
            : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {isFriend ? <UserX className="h-4 w-4" /> : hasPendingRequest ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {isFriend ? "Unfriend" : hasPendingRequest ? "Requested" : "Add Friend"}
    </button>
  );
};
