import { useEffect, useState } from "react";

/**
 * A finger is the main pointer: no hover, coarse aim. Phones and tablets, not a
 * laptop that happens to have a touchscreen — those keep the mouse layout,
 * because their trackpad is still what most of the work goes through.
 */
const QUERY = "(hover: none) and (pointer: coarse)";

/** Whether to use the touch interface: swipe gestures and sheets. */
export function useTouchUI(): boolean {
  const [touch, setTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setTouch(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return touch;
}
