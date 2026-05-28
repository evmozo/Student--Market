import { useEffect, useMemo, useState } from "react";
import type { User } from "../types";

export const Avatar = ({
  user,
  name,
  src,
  className = "h-10 w-10",
  fallbackClassName = ""
}: {
  user?: Pick<User, "name" | "profilePicture"> | null;
  name?: string;
  src?: string;
  className?: string;
  fallbackClassName?: string;
}) => {
  const displayName = name ?? user?.name ?? "Student";
  const imageSrc = src ?? user?.profilePicture;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? "S") + (parts[1]?.[0] ?? "");
  }, [displayName]);

  if (imageSrc && !failed) {
    return (
      <img
        src={imageSrc}
        alt={displayName}
        className={`${className} object-cover`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${className} inline-grid place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-sm font-black uppercase text-white ${fallbackClassName}`}
      title={displayName}
    >
      {initials}
    </span>
  );
};
