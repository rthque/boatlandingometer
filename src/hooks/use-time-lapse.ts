import { useCallback, useEffect, useRef, useState } from "react";
import { shiftDay } from "@/lib/tide-math";

export type AnimState = "idle" | "playing" | "paused";

/**
 * Speed range, in seconds of wall clock per simulated 24 h.
 *
 * The slow end is the speed the time-lapse always ran at, and it stays the
 * default: it is the one where you can follow the water up the ladder. The fast
 * end is 48× that — four days a second — and it exists for a different
 * question. At that rate a single day is a blur, but the *envelope* of the
 * curve is not: you watch the range swell and collapse over the springs and
 * neaps, which is the thing a table of coefficients tells you and no single
 * day's graph ever shows.
 */
export const SLOW_SEC_PER_DAY = 12;
export const FAST_SEC_PER_DAY = 0.25;

/** Slider travel. The position is unitless; SPEED_POS_MAX only sets its resolution. */
export const SPEED_POS_MAX = 100;

/**
 * Slider position -> seconds per simulated day, geometric rather than linear.
 *
 * A linear slider over a 48× range is unusable: the whole slow half of the
 * range, where the water is actually legible, is squeezed into the last few
 * percent of the travel. On a log scale every millimetre of the track is the
 * same *proportional* change in speed, so the slow end gets as much room as the
 * fast end and the thumb lands where you aim it.
 */
export function posToSecPerDay(pos: number): number {
  const u = Math.min(1, Math.max(0, pos / SPEED_POS_MAX));
  return SLOW_SEC_PER_DAY * Math.pow(FAST_SEC_PER_DAY / SLOW_SEC_PER_DAY, u);
}

/**
 * How the chosen speed is written out.
 *
 * It flips units at one second per day, because past that "0.25 s/day" is a
 * number you have to invert in your head to picture, and "4.0 days/s" is the
 * thing you are actually watching.
 */
export function fmtSpeed(secPerDay: number): string {
  if (secPerDay >= 1)
    return `${secPerDay < 10 ? secPerDay.toFixed(1) : secPerDay.toFixed(0)} s/day`;
  return `${(1 / secPerDay).toFixed(1)} days/s`;
}

/**
 * Longest frame the clock will honour, in seconds of wall time.
 *
 * requestAnimationFrame stops in a hidden tab, so the first frame after coming
 * back carries the whole time away — at four days a second, half a minute in
 * another tab would be four months of tide advanced in one step, with a hundred
 *-odd days shifted one at a time to get there. Clamping means the time-lapse
 * resumes where you left it rather than teleporting. It also guarantees at most
 * one midnight per frame at the fastest setting (0.1 s x 96 h/s = 9.6 h).
 */
const MAX_FRAME_S = 0.1;

/**
 * Time-lapse animation: a clock running at an adjustable multiple of real time,
 * rolling over to the next day. It drives both the dashed "now" marker (animT)
 * and the red height line (which tracks the tide at animT). Advancing past the
 * last available day stops the clock at midnight.
 */
export function useTimeLapse(selectedDate: Date, setSelectedDate: (d: Date) => void) {
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [animT, setAnimT] = useState(0);
  const [speedPos, setSpeedPos] = useState(0);
  const animTRef = useRef(0);
  const selectedDateRef = useRef(selectedDate);

  const secPerDay = posToSecPerDay(speedPos);

  // The loop reads the speed from a ref rather than taking it as a dependency.
  // Re-running the effect would tear down and restart the rAF loop on every
  // pixel the thumb moves; through a ref the running clock simply picks up the
  // new rate on its next frame, so dragging the slider never interrupts
  // playback or drops the position.
  const hoursPerSecRef = useRef(24 / secPerDay);
  useEffect(() => {
    hoursPerSecRef.current = 24 / secPerDay;
  }, [secPerDay]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    if (animState !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_FRAME_S);
      last = now;
      let t = animTRef.current + dt * hoursPerSecRef.current;

      if (t >= 24) {
        // A loop, not a single subtraction: one frame may span more than a day
        // if the machine stutters, and taking 24 off once would leave the clock
        // past midnight with the marker off the right-hand edge.
        let date = selectedDateRef.current;
        while (t >= 24) {
          t -= 24;
          const next = shiftDay(date, 1);
          if (next === null) {
            // Reached the last available day — stop at midnight.
            animTRef.current = 0;
            setAnimT(0);
            setAnimState("idle");
            return;
          }
          date = next;
        }
        selectedDateRef.current = date;
        setSelectedDate(date);
      }

      animTRef.current = t;
      setAnimT(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animState, setSelectedDate]);

  const startAnim = useCallback(() => {
    animTRef.current = 0;
    setAnimT(0);
    setAnimState("playing");
  }, []);
  const stopAnim = useCallback(() => {
    animTRef.current = 0;
    setAnimT(0);
    setAnimState("idle");
  }, []);

  return {
    animState,
    setAnimState,
    animT,
    animating: animState === "playing", // clock advancing
    animActive: animState !== "idle", // marker/boat on screen
    startAnim,
    stopAnim,
    speedPos,
    setSpeedPos,
    secPerDay,
  };
}
