import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, MessageCircle, Search, Shield, Sparkles, Store, UserRound, UsersRound } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { Avatar } from "./Avatar";
import { NotificationBell } from "./NotificationBell";
import { VerifiedBadge } from "./VerifiedBadge";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
    isActive ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-white hover:text-slate-950"
  }`;

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const profileId = user?.id ?? user?._id;

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-950">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-blue-100">
            <img src="/logo.jpeg" alt="NEMSU logo" className="h-full w-full object-cover" />
          </span>
          <span className="hidden sm:inline">NEMSU Market</span>
        </Link>
        <div className="hidden min-w-0 flex-1 items-center rounded-md border border-white bg-white/75 px-3 text-slate-500 shadow-sm md:flex">
          <Search className="h-4 w-4" />
          <span className="ml-2 truncate py-2 text-sm">Search posts, students, chats</span>
          <span className="ml-auto hidden items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 lg:inline-flex">
            <Sparkles className="h-3 w-3" />
            Demo ready
          </span>
        </div>
        <nav className="ml-auto flex items-center gap-1">
          <NavLink to="/" className={linkClass}>
            <Store className="h-4 w-4" />
            <span className="hidden md:inline">Feed</span>
          </NavLink>
          <NavLink to="/chats" className={linkClass}>
            <MessageCircle className="h-4 w-4" />
            <span className="hidden md:inline">Chats</span>
          </NavLink>
          <NavLink to="/friends" className={linkClass}>
            <UsersRound className="h-4 w-4" />
            <span className="hidden md:inline">Friends</span>
          </NavLink>
          {user?.role === "admin" ? (
            <NavLink to="/admin" className={linkClass}>
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Admin</span>
            </NavLink>
          ) : null}
          <NotificationBell />
          {user && profileId ? (
            <Link to={`/profile/${profileId}`} className="hidden items-center gap-2 rounded-md border border-white bg-white/70 px-2 py-1 shadow-sm hover:bg-white sm:flex">
              <Avatar user={user} className="h-8 w-8 rounded-full" />
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold leading-4">{user.name}</p>
                <VerifiedBadge user={user} compact />
              </div>
            </Link>
          ) : (
            <UserRound className="h-5 w-5" />
          )}
          <button type="button" onClick={onLogout} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </header>
  );
};
