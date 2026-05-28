import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, apiData } from "../utils/api";

export const ForgotPassword = () => {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async (values: { email: string }) => {
    const data = await apiData<{ message: string; resetToken?: string }>(api.post("/auth/forgot-password", values));
    setResetToken(data.resetToken ?? null);
    toast.success(data.message);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-bold">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">A reset link is logged by the backend in development.</p>
        <input {...register("email", { required: true })} type="email" placeholder="Email" className="mt-5 w-full rounded-md border border-slate-200 px-3 py-2" />
        <button className="mt-4 w-full rounded-md bg-slate-900 py-2 font-semibold text-white">Send reset link</button>
        {resetToken ? <p className="mt-3 break-all rounded-md bg-slate-100 p-3 text-xs">Dev reset token: {resetToken}</p> : null}
        <Link to="/login" className="mt-4 block text-center text-sm font-semibold text-blue-700">Back to login</Link>
      </form>
    </main>
  );
};
