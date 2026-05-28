import { CheckCircle2 } from "lucide-react";
import type { User, VerificationStatus } from "../types";

const labelMap: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  unverified: "Unverified"
};

export const VerifiedBadge = ({ user, compact = false }: { user: User; compact?: boolean }) => {
  const status = user.verificationStatus;
  const classes =
    status === "verified"
      ? "bg-blue-50 text-blue-700"
      : status === "pending"
        ? "bg-orange-50 text-orange-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      title={status === "verified" ? `Verified Student of ${user.school ?? "their school"}` : labelMap[status]}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${classes}`}
    >
      {status === "verified" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      {compact && status === "verified" ? "Verified" : labelMap[status]}
    </span>
  );
};
