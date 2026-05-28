import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export const EmptyState = ({ title, message, icon }: { title: string; message: string; icon?: ReactNode }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500">
      {icon ?? <Inbox className="h-7 w-7" />}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
  </div>
);
