import { motion } from "framer-motion";
import { Copy, RotateCcw, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "../types";
import { chatTime } from "../utils/timeFormat";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export const MessageBubble = ({
  message,
  own,
  senderName,
  onReply,
  onUnsend,
  onRemove,
  onReact
}: {
  message: ChatMessage;
  own: boolean;
  senderName: string;
  onReply: (message: ChatMessage) => void;
  onUnsend: (message: ChatMessage) => void;
  onRemove: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
}) => {
  const [menu, setMenu] = useState(false);

  const copy = async () => {
    if (!message.text) return;
    await navigator.clipboard.writeText(message.text);
    toast.success("Message copied.");
    setMenu(false);
  };

  const body = message.isUnsent ? (
    <span className="italic text-slate-500">{senderName} unsent a message</span>
  ) : message.mediaUrl && message.mediaType === "image" ? (
    <img src={message.mediaUrl} alt="Message attachment" className="max-h-72 rounded-md object-cover" loading="lazy" />
  ) : message.mediaUrl && message.mediaType === "video" ? (
    <video src={message.mediaUrl} controls className="max-h-80 max-w-full rounded-md bg-slate-950" />
  ) : message.mediaUrl && message.mediaType === "voice" ? (
    <audio src={message.mediaUrl} controls className="max-w-full" />
  ) : (
    <span>{message.text}</span>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`group flex ${own ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[78%] ${own ? "text-right" : "text-left"}`}>
        <button type="button" onClick={() => setMenu((value) => !value)} className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${own ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}>
          {body}
        </button>
        <div className={`mt-1 text-[11px] text-slate-400 ${own ? "text-right" : "text-left"}`}>
          {chatTime(message.createdAt)}
          {own ? ` · ${message.readBy.length > 1 ? "Read" : "Sent"}` : null}
        </div>
        {message.reactions.length ? (
          <div className={`mt-1 flex gap-1 ${own ? "justify-end" : "justify-start"}`}>
            {message.reactions.map((reaction) => (
              <span key={`${reaction.user}-${reaction.emoji}`} className="rounded-full bg-white px-1.5 py-0.5 text-xs shadow">{reaction.emoji}</span>
            ))}
          </div>
        ) : null}
        {menu ? (
          <div className={`absolute z-10 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-2 text-left shadow-soft ${own ? "right-0" : "left-0"}`}>
            <div className="mb-2 flex gap-1 border-b border-slate-100 pb-2">
              {emojis.map((emoji) => (
                <button key={emoji} type="button" onClick={() => onReact(message, emoji)} className="rounded-md px-2 py-1 hover:bg-slate-100">
                  {emoji}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => onReply(message)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100">
              <Undo2 className="h-4 w-4" /> Reply
            </button>
            <button type="button" onClick={copy} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100">
              <Copy className="h-4 w-4" /> Copy
            </button>
            {own && !message.isUnsent ? (
              <button type="button" onClick={() => onUnsend(message)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100">
                <RotateCcw className="h-4 w-4" /> Unsend
              </button>
            ) : null}
            <button type="button" onClick={() => onRemove(message)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Remove for you
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};
