import { Bell, MessageCircle, Shield, ShieldCheck, Store, UsersRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Avatar } from "./Avatar";
import { VerifiedBadge } from "./VerifiedBadge";

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 font-bold transition ${
    isActive ? "bg-white text-blue-700 shadow-sm" : "text-slate-700 hover:bg-white hover:text-blue-700 hover:shadow-sm"
  }`;

export const AppSidebar = ({ className = "" }: { className?: string }) => {
  const user = useAuthStore((state) => state.user);
  const profileId = user?.id ?? user?._id;

  return (
    <aside className={`hidden h-fit lg:sticky lg:top-20 lg:block ${className}`}>
      <section className="space-y-2">
        {user && profileId ? (
          <Link to={`/profile/${profileId}`} className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-white hover:shadow-sm">
            <Avatar user={user} className="h-11 w-11 rounded-full ring-2 ring-white" />
            <div className="min-w-0">
              <p className="truncate font-black text-slate-950">{user.name}</p>
              <VerifiedBadge user={user} compact />
            </div>
          </Link>
        ) : null}
        <NavLink to="/" end className={itemClass}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
            <Store className="h-5 w-5 text-blue-600" />
          </span>
          Marketplace Feed
        </NavLink>
        <NavLink to="/friends" className={itemClass}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
            <UsersRound className="h-5 w-5 text-emerald-600" />
          </span>
          Friends
        </NavLink>
        <NavLink to="/chats" className={itemClass}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
            <MessageCircle className="h-5 w-5 text-violet-600" />
          </span>
          Messenger
        </NavLink>
        {profileId ? (
          <NavLink to={`/profile/${profileId}`} className={itemClass}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
              <ShieldCheck className="h-5 w-5 text-sky-600" />
            </span>
            Verification
          </NavLink>
        ) : null}
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-bold text-slate-700 transition hover:bg-white hover:text-blue-700 hover:shadow-sm">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
            <Bell className="h-5 w-5 text-amber-600" />
          </span>
          Notifications
        </Link>
        {user?.role === "admin" ? (
          <NavLink to="/admin" className={itemClass}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
              <Shield className="h-5 w-5 text-red-600" />
            </span>
            Admin
          </NavLink>
        ) : null}
      </section>
    </aside>
  );
};
