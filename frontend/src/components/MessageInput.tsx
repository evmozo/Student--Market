import { ImagePlus, Loader2, Send, Smile, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage, MediaType } from "../types";
import { uploadFile } from "../utils/api";
import { VoiceRecorder } from "./VoiceRecorder";

export interface OutgoingMessage {
  text?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  voiceDuration?: number;
  replyTo?: string;
}

export const MessageInput = ({
  disabled,
  replyingTo,
  onCancelReply,
  onTyping,
  onSend
}: {
  disabled?: boolean;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
  onTyping: () => void;
  onSend: (message: OutgoingMessage) => Promise<void>;
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState<"image" | "video" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const submit = async (message: OutgoingMessage) => {
    setSending(true);
    try {
      await onSend({ ...message, replyTo: replyingTo?._id });
      setText("");
      onCancelReply();
      if (textareaRef.current) textareaRef.current.style.height = "44px";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message failed");
    } finally {
      setSending(false);
    }
  };

  const sendText = () => {
    if (!text.trim()) return;
    submit({ text: text.trim() });
  };

  const sendMedia = async (file?: File) => {
    if (!file) return;
    const mediaType = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
    if (!mediaType) {
      toast.error("Only image and video attachments are supported.");
      return;
    }
    setUploadingMedia(mediaType);
    try {
      const url = await uploadFile(file, "messages");
      await submit({ mediaUrl: url, mediaType });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingMedia(null);
    }
  };

  const sendVoice = async (file: File, duration: number) => {
    const url = await uploadFile(file, "voice");
    await submit({ mediaUrl: url, mediaType: "voice", voiceDuration: duration });
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      {replyingTo ? (
        <div className="mb-2 flex items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-sm">
          <span className="truncate">Replying to: {replyingTo.text ?? replyingTo.mediaType ?? "message"}</span>
          <button type="button" onClick={onCancelReply} className="rounded-full p-1 hover:bg-slate-200" aria-label="Cancel reply">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <label className="cursor-pointer rounded-full p-2 text-slate-500 hover:bg-slate-100" title="Send image">
          {uploadingMedia === "image" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <input
            type="file"
            accept="image/*"
            disabled={Boolean(uploadingMedia)}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void sendMedia(file);
            }}
          />
        </label>
        <label className="cursor-pointer rounded-full p-2 text-slate-500 hover:bg-slate-100" title="Send video">
          {uploadingMedia === "video" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
            disabled={Boolean(uploadingMedia)}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void sendMedia(file);
            }}
          />
        </label>
        <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Emoji picker">
          <Smile className="h-5 w-5" />
        </button>
        <VoiceRecorder onRecorded={sendVoice} />
        <textarea
          ref={textareaRef}
          value={text}
          rows={1}
          disabled={disabled || sending}
          onChange={(event) => {
            setText(event.target.value);
            onTyping();
            event.currentTarget.style.height = "44px";
            event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 140)}px`;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendText();
            }
          }}
          placeholder="Message"
          className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={sendText}
          disabled={disabled || sending || !text.trim()}
          className="rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
