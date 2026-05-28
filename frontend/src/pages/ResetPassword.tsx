import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import { api, apiData, setAuthToken } from "../utils/api";
import type { User } from "../types";

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { register, handleSubmit } = useForm<{ password: string }>();

  const onSubmit = async (values: { password: string }) => {
    const token = params.get("token");
    if (!token) {
      toast.error("Missing reset token.");
      return;
    }
    const data = await apiData<{ user: User; token: string }>(api.post("/auth/reset-password", { token, password: values.password }));
    sessionStorage.setItem("student_marketplace_token", data.token);
    setAuthToken(data.token);
    setUser(data.user);
    toast.success("Password updated.");
    navigate("/");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-bold">Choose a new password</h1>
        <input {...register("password", { required: true, minLength: 8 })} type="password" className="mt-5 w-full rounded-md border border-slate-200 px-3 py-2" />
        <button className="mt-4 w-full rounded-md bg-blue-600 py-2 font-semibold text-white">Update password</button>
      </form>
    </main>
  );
};
