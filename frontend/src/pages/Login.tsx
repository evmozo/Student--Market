import { motion } from "framer-motion";
import { ArrowRight, Eye, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthShowcase } from "../components/AuthShowcase";
import { useAuthStore } from "../stores/authStore";

interface LoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginForm>();

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_48%,#dbeafe_100%)] p-4">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[length:34px_34px]" />
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <AuthShowcase mode="login" />
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="relative w-full rounded-lg border border-blue-100 bg-white/95 p-6 shadow-soft backdrop-blur sm:p-8"
        >
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-blue-100">
            <img src="/logo.jpeg" alt="NEMSU logo" className="h-full w-full object-cover" />
          </span>
          <div>
            <p className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-black text-blue-700">
              <Sparkles className="h-3 w-3" />
              NEMSU Market
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Welcome back</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Sign in with your student account.</p>
          </div>
        </motion.div>
        <label className="mt-6 block text-sm font-semibold text-slate-700">
          Email
          <div className="mt-1 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            <input {...register("email", { required: true })} type="email" className="w-full bg-transparent py-3 outline-none" />
          </div>
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Password
          <div className="mt-1 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm">
            <Lock className="h-4 w-4 text-slate-400" />
            <input {...register("password", { required: true })} type={showPassword ? "text" : "password"} className="w-full bg-transparent py-3 outline-none" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400" aria-label="Show password">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </label>
        {Object.keys(formState.errors).length ? <p className="mt-3 text-sm text-red-600">Email and password are required.</p> : null}
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-semibold text-blue-700">Forgot password?</Link>
          <Link to="/register" className="font-semibold text-blue-700">Create account</Link>
        </div>
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-700 to-sky-500 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-800 hover:to-sky-600 disabled:opacity-60">
          {loading ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-600">
          <span className="rounded-md bg-blue-50 px-2 py-2 text-blue-700"><ShieldCheck className="mr-1 inline h-3 w-3" />Verified</span>
          <span className="rounded-md bg-sky-50 px-2 py-2 text-sky-700">Realtime</span>
          <span className="rounded-md bg-slate-100 px-2 py-2">Campus</span>
        </div>
        </motion.form>
      </div>
    </main>
  );
};
