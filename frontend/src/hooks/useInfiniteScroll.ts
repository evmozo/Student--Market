import { useEffect, useRef } from "react";

export const useInfiniteScroll = (onIntersect: () => void, active: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !active) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: "500px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active, onIntersect]);

  return ref;
};
