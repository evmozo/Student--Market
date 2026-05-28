import { useSocketStore } from "../stores/socketStore";

export const useOnlineStatus = (userId?: string): boolean => {
  const onlineUserIds = useSocketStore((state) => state.onlineUserIds);
  return userId ? onlineUserIds.has(userId) : false;
};
