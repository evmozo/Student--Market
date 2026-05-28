import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { Skeleton } from "./components/Skeleton";
import { useAuthStore } from "./stores/authStore";
import { useSocketStore } from "./stores/socketStore";
import { Admin } from "./pages/Admin";
import { ChatList } from "./pages/ChatList";
import { ChatRoom } from "./pages/ChatRoom";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Friends } from "./pages/Friends";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword";

const PageFrame = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }}>
    {children}
  </motion.div>
);

const ProtectedLayout = () => {
  const { user, bootstrapped, loadMe, token } = useAuthStore();
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (token) connect(token);
    return () => disconnect();
  }, [connect, disconnect, token]);

  if (!bootstrapped) {
    return <main className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-96 w-full" /></main>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Admin />;
};

export const App = () => {
  const location = useLocation();

  return (
    <>
      <Toaster richColors position="top-right" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageFrame><Login /></PageFrame>} />
          <Route path="/register" element={<PageFrame><Register /></PageFrame>} />
          <Route path="/forgot-password" element={<PageFrame><ForgotPassword /></PageFrame>} />
          <Route path="/reset-password" element={<PageFrame><ResetPassword /></PageFrame>} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<PageFrame><Home /></PageFrame>} />
            <Route path="/chats" element={<PageFrame><ChatList /></PageFrame>} />
            <Route path="/chats/:conversationId" element={<PageFrame><ChatRoom /></PageFrame>} />
            <Route path="/chats/direct/:recipientId" element={<PageFrame><ChatRoom /></PageFrame>} />
            <Route path="/friends" element={<PageFrame><Friends /></PageFrame>} />
            <Route path="/profile/:id" element={<PageFrame><Profile /></PageFrame>} />
            <Route path="/admin" element={<PageFrame><AdminRoute /></PageFrame>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
};
