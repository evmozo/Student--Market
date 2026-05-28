import { Mic, Square } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const VoiceRecorder = ({ onRecorded }: { onRecorded: (file: File, duration: number) => void | Promise<void> }) => {
  const [recording, setRecording] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Voice recording is not supported in this browser.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone permission was denied.");
      return;
    }
    chunks.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    recorder.current = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      void Promise.resolve(onRecorded(new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" }), duration)).catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Voice upload failed");
      });
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorder.start();
    setStartedAt(Date.now());
    setRecording(true);
  };

  const stop = () => {
    recorder.current?.stop();
    setRecording(false);
  };

  return (
    <button
      type="button"
      onMouseDown={start}
      onMouseUp={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      className={`relative rounded-full p-2 ${recording ? "bg-red-100 text-red-700" : "text-slate-500 hover:bg-slate-100"}`}
      aria-label={recording ? "Stop recording" : "Hold to record voice"}
    >
      {recording ? <span className="absolute inset-0 rounded-full bg-red-400/40 animate-pulseRing" /> : null}
      {recording ? <Square className="relative h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
};
