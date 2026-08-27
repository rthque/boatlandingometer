import { useEffect, useState } from "react";

/**
 * Intrinsic width/height of an image, once the browser has decoded it.
 *
 * Returns null until then (and for a null src), so callers fall back to
 * something sane rather than guessing a ratio and distorting the picture.
 * Reading it at runtime is what lets a backdrop photo be swapped by dropping a
 * new file in — no pixel geometry to re-derive by hand.
 */
export function useImageRatio(src: string | null): number | null {
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!src) {
      setRatio(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalWidth > 0 && img.naturalHeight > 0) {
        setRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return ratio;
}
