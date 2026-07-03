import { useEffect, useRef, useState } from "react";

// Track the plot container's pixel size (clamped to a sensible minimum) and,
// while mounted, lock the page so the full-bleed schema can't scroll or bounce.
export function usePlotSize() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 900, height: 700 });

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({
          width: Math.max(320, Math.floor(e.contentRect.width)),
          height: Math.max(400, Math.floor(e.contentRect.height)),
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, []);

  return { containerRef, size };
}
