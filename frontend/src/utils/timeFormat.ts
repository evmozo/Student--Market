import { format, formatDistanceToNowStrict, isToday, parseISO } from "date-fns";

export const relativeTime = (date?: string): string => {
  if (!date) return "";
  return `${formatDistanceToNowStrict(parseISO(date), { addSuffix: true })}`;
};

export const chatTime = (date?: string): string => {
  if (!date) return "";
  const parsed = parseISO(date);
  return isToday(parsed) ? format(parsed, "p") : format(parsed, "MMM d, p");
};

export const activeLabel = (date?: string, online = false): string => {
  if (online) return "Active now";
  return date ? `Active ${relativeTime(date)}` : "Offline";
};
