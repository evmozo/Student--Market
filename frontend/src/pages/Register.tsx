import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Lock, Mail, School, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthShowcase } from "../components/AuthShowcase";
import { useAuthStore } from "../stores/authStore";
import { nemsuCampuses, nemsuCourses } from "../utils/constants";
import { passwordScore } from "../utils/validators";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  school: string;
  course: string;
}

export const Register = () => {
  const { register: createAccount, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState } = useForm<RegisterForm>();
  const password = watch("password") ?? "";
  const score = useMemo(() => passwordScore(password), [password]);

  const onSubmit = async (values: RegisterForm) => {
    try {
      await createAccount(values);
      toast.success("Account created. Submit verification to unlock posting.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_48%,#dbeafe_100%)] p-4">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[length:34px_34px]" />
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
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
            <h1 className="mt-2 text-2xl font-black text-slate-950">Create student account</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Browse now. Posting unlocks after verification.</p>
          </div>
        </motion.div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Name<div className="mt-1 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 focus-within:border-blue-500 focus-within:bg-white"><UserRound className="h-4 w-4 text-slate-400" /><input {...register("name", { required: true })} className="w-full bg-transparent py-3 outline-none" /></div></label>
          <label className="block text-sm font-semibold">Email<div className="mt-1 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 focus-within:border-blue-500 focus-within:bg-white"><Mail className="h-4 w-4 text-slate-400" /><input {...register("email", { required: true })} type="email" className="w-full bg-transparent py-3 outline-none" /></div></label>
          <label className="block text-sm font-semibold">Campus<div className="mt-1 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 focus-within:border-blue-500 focus-within:bg-white"><School className="h-4 w-4 text-slate-400" /><select {...register("school", { required: true })} className="w-full bg-transparent py-3 outline-none"><option value="">Select campus</option>{nemsuCampuses.map((campus) => <option key={campus.value} value={campus.value}>{campus.label}</option>)}</select></div></label>
          <label className="block text-sm font-semibold">Course<div className="mt-1 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 focus-within:border-blue-500 focus-within:bg-white"><GraduationCap className="h-4 w-4 text-slate-400" /><select {...register("course", { required: true })} className="w-full bg-transparent py-3 outline-none"><option value="">Select course</option>{nemsuCourses.map((course) => <option key={course} value={course}>{course}</option>)}</select></div></label>
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <div className="mt-1 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/50 px-3 focus-within:border-blue-500 focus-within:bg-white">
            <Lock className="h-4 w-4 text-slate-400" />
            <input {...register("password", { required: true, minLength: 8 })} type="password" className="w-full bg-transparent py-3 outline-none" />
          </div>
        </label>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((item) => <motion.span key={item} initial={false} animate={{ scaleX: item < score ? 1 : 0.72 }} className={`h-1 origin-left rounded-full ${item < score ? "bg-blue-600" : "bg-slate-200"}`} />)}
        </div>
        {Object.keys(formState.errors).length ? <p className="mt-3 text-sm text-red-600">Please fill the required fields. Password must be at least 8 characters.</p> : null}
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-700 to-sky-500 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-800 hover:to-sky-600 disabled:opacity-60">
          {loading ? "Creating..." : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-600">
          <span className="rounded-md bg-blue-50 px-2 py-2 text-blue-700"><ShieldCheck className="mr-1 inline h-3 w-3" />Verified</span>
          <span className="rounded-md bg-sky-50 px-2 py-2 text-sky-700">Campus</span>
          <span className="rounded-md bg-slate-100 px-2 py-2">Secure</span>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-blue-700">Sign in</Link></p>
        </motion.form>
        <AuthShowcase mode="register" />
      </div>
    </main>
  );
};
