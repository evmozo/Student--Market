import { X } from "lucide-react";
import { motion } from "framer-motion";

export const MediaViewer = ({ url, onClose }: { url: string | null; onClose: () => void }) => {
  if (!url) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close media viewer"
      >
        <X className="h-5 w-5" />
      </button>
      <img src={url} alt="Full size attachment" className="max-h-full max-w-full rounded-lg object-contain" />
    </motion.div>
  );
};
