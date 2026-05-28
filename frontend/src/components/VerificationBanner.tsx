import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import { api, apiData, uploadFile } from "../utils/api";

export const VerificationBanner = () => {
  const { user, setUser } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.verificationStatus === "verified") return null;

  const onSubmit = async () => {
    if (!file) {
      toast.error("Choose your COR or School ID first.");
      return;
    }
    setSubmitting(true);
    try {
      const url = await uploadFile(file, "verification");
      const data = await apiData<{ user: typeof user }>(api.post("/verification/submit", { verificationDocument: url }));
      setUser(data.user);
      toast.success("Verification submitted.");
      setFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const statusText =
    user.verificationStatus === "pending"
      ? "Your verification is pending admin review."
      : user.verificationStatus === "rejected"
        ? `Rejected: ${user.verificationRejectionReason ?? "Please upload a clearer document."}`
        : "Upload your COR or School ID to start selling and messaging.";

  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-blue-950">Student verification required</p>
          <p className="mt-1 text-sm text-blue-800">{statusText}</p>
          {file ? <p className="mt-2 text-sm font-medium text-blue-950">Selected: {file.name}</p> : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100">
            <UploadCloud className="h-4 w-4" />
            Choose file
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !file}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </section>
  );
};
