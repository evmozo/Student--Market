import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketStore } from "../stores/socketStore";

export const useTypingIndicator = (conversationId: string, recipientId: string) => {
  const socket = useSocketStore((state) => state.socket);
  const [isTyping, setIsTyping] = useState(false);
  const stopTimer = useRef<number>();

  const emitTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("message:typing", { conversationId, recipientId, isTyping: true });
    window.clearTimeout(stopTimer.current);
    stopTimer.current = window.setTimeout(() => {
      socket.emit("message:typing", { conversationId, recipientId, isTyping: false });
    }, 2000);
  }, [conversationId, recipientId, socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: { conversationId: string; isTyping: boolean }) => {
      if (payload.conversationId === conversationId) setIsTyping(payload.isTyping);
    };
    socket.on("message:typing", handler);
    return () => {
      socket.off("message:typing", handler);
      window.clearTimeout(stopTimer.current);
    };
  }, [conversationId, socket]);

  return { isTyping, emitTyping };
};
