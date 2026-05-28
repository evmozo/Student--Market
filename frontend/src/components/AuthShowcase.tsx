import { motion } from "framer-motion";
import { BookOpen, GraduationCap, MessageCircle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";

const stickers = [
  { label: "Verified students", icon: ShieldCheck, className: "left-5 top-8 rotate-[-5deg]", color: "text-blue-700" },
  { label: "Realtime chats", icon: MessageCircle, className: "right-6 top-24 rotate-[6deg]", color: "text-sky-700" },
  { label: "Book deals", icon: BookOpen, className: "left-10 bottom-24 rotate-[4deg]", color: "text-emerald-700" },
  { label: "Campus pickup", icon: ShoppingBag, className: "right-10 bottom-12 rotate-[-5deg]", color: "text-violet-700" }
];

export const AuthShowcase = ({ mode }: { mode: "login" | "register" }) => (
  <section className="relative hidden min-h-[620px] overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_52%,#dbeafe_100%)] p-8 text-slate-950 shadow-soft lg:block">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.06)_1px,transparent_1px)] bg-[length:30px_30px]" />
    <div className="relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-black text-blue-700 shadow-sm ring-1 ring-blue-100"
      >
        <img src="/logo.jpeg" alt="NEMSU logo" className="h-7 w-7 rounded-full object-cover" />
        NEMSU Market
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mt-8 max-w-sm text-4xl font-black leading-tight tracking-normal text-slate-950"
      >
        {mode === "login" ? "Sign in to your campus marketplace." : "Create your student trading profile."}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-600"
      >
        Blue-and-white student marketplace for verified NEMSU profiles, campus posts, friend requests, and Messenger-style chat.
      </motion.p>
    </div>

    <motion.div
      animate={{ y: [0, -8, 0], rotate: [-1.5, 1, -1.5] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-40 left-1/2 z-10 w-72 -translate-x-1/2 rounded-lg border border-blue-100 bg-white p-5 text-slate-950 shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-blue-50 ring-2 ring-blue-100">
          <img src="/logo.jpeg" alt="NEMSU logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-black text-blue-700">Student Trust Score</p>
          <p className="text-2xl font-black">Verified</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-600">
        <span className="rounded-md bg-blue-50 px-2 py-2 text-blue-700">Posts</span>
        <span className="rounded-md bg-sky-50 px-2 py-2 text-sky-700">Chats</span>
        <span className="rounded-md bg-emerald-50 px-2 py-2 text-emerald-700">Friends</span>
      </div>
    </motion.div>

    {stickers.map((item, index) => {
      const Icon = item.icon;
      return (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.8, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{ delay: 0.2 + index * 0.08, y: { duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut" } }}
          className={`absolute z-20 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-xl ${item.className}`}
        >
          <Icon className={`h-4 w-4 ${item.color}`} />
          {item.label}
        </motion.div>
      );
    })}

    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute right-8 top-1/2 z-10 rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-lg"
    >
      <Sparkles className="mr-2 inline h-4 w-4" />
      School-ready
    </motion.div>

    <GraduationCap className="absolute bottom-7 left-8 h-10 w-10 text-blue-200" />
  </section>
);
