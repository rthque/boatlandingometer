import { useEffect, useRef, useState } from "react";
import { shiftDay } from "@/lib/tide-math";

export type AnimState = "idle" | "playing" | "paused";

// Time-lapse animation: a clock that runs at 1 h = 0.5 s (a 24 h day in 12 s),
// rolling over to the next day. It drives both the dashed "now" marker (animT)
// and the red height line (which tracks the tide at animT). Advancing past the
// last available day stops the clock at midnight.
export function useTimeLapse(selectedDate: Date, setSelectedDate: (d: Date) => void) {
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [animT, setAnimT] = useState(0);
  const animTRef = useRef(0);
  const selectedDateRef = useRef(selectedDate);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    if (animState !== "playing") return;
    const HOURS_PER_SEC = 2; // 1 h = 0.5 s
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      let t = animTRef.current + dt * HOURS_PER_SEC;
      if (t >= 24) {
        t -= 24;
        const next = shiftDay(selectedDateRef.current, 1);
        if (next === null) {
          // Reached the last available day — stop at midnight.
          animTRef.current = 0;
          setAnimT(0);
          setAnimState("idle");
          return;
        }
        selectedDateRef.current = next;
        setSelectedDate(next);
      }
      animTRef.current = t;
      setAnimT(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animState, setSelectedDate]);

  const startAnim = () => {
    animTRef.current = 0;
    setAnimT(0);
    setAnimState("playing");
  };
  const stopAnim = () => {
    animTRef.current = 0;
    setAnimT(0);
    setAnimState("idle");
  };

  return {
    animState,
    setAnimState,
    animT,
    animating: animState === "playing", // clock advancing
    animActive: animState !== "idle", // marker/boat on screen
    startAnim,
    stopAnim,
  };
}
