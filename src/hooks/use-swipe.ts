import { useEffect, useRef, type RefObject } from "react";

export type SwipeActions = {
  /** Off on a mouse, and while a sheet is open. */
  enabled: boolean;
  /** False at the ends of the date range: the swipe resists and does nothing. */
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Top to bottom. */
  onDown: () => void;
  /** Bottom to top. */
  onUp: () => void;
};

/** Movement before a touch counts as a swipe rather than a tap, px. */
const SLOP = 12;
/** The leading axis must beat the other by this ratio to lock the swipe to it. */
const LOCK = 1.3;
/** Travel at which letting go commits, px. Below it, letting go cancels. */
const COMMIT_X = 72;
const COMMIT_Y = 80;
/** A flick commits early: this fast (px/ms), over at least FLICK_MIN px. */
const FLICK_V = 0.5;
const FLICK_MIN = 36;
/**
 * How far the chart follows a horizontal finger: a nudge, not a carousel. At
 * 56 px it bared a strip of page at the far edge; 24 still reads as "it moves
 * with me" without that.
 */
const FOLLOW = 0.2;
const FOLLOW_MAX = 24;
/** At the end of the date range: it barely moves, which reads as "no further". */
const BLOCKED = 0.08;
const BLOCKED_MAX = 14;
/** How far the calendar / info hints come in from their edge, px. */
const HINT_Y = 120;

/**
 * Where a swipe may not start: anything that already does something with a
 * touch. The red line's drag band carries data-no-swipe, so dragging the line
 * never turns the day over; so does the speed panel.
 */
const NO_SWIPE =
  'button, a, input, select, textarea, label, video, [role="slider"], [role="switch"], [role="group"], [role="dialog"], [data-no-swipe]';

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

/**
 * Touch swipes on the app's empty ground: left / right for the next / previous
 * day, down for the calendar, up for the info.
 *
 * Built for control rather than speed. Nothing happens on touch-down; the
 * swipe locks to one axis only once the finger has clearly chosen one; a hint
 * names what letting go will do and fills in once it will; and coming back
 * before letting go cancels it. A quick flick commits early, as it does on
 * every phone.
 *
 * It drives the DOM directly — the chart's transform and the hints' style —
 * rather than through React state, because state would re-render the whole
 * chart on every pixel the finger moves. Only a committed swipe reaches React,
 * through the action it calls.
 *
 * Native listeners on the root, not React's: they see the event before any
 * React handler can stop it, which is why the exclusions above are explicit.
 */
export function useSwipe(
  rootRef: RefObject<HTMLElement | null>,
  chartRef: RefObject<HTMLElement | null>,
  actions: SwipeActions,
) {
  const live = useRef(actions);
  useEffect(() => {
    live.current = actions;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let id: number | null = null;
    let x0 = 0;
    let y0 = 0;
    let dx = 0;
    let dy = 0;
    let axis: "x" | "y" | null = null;
    let armed = false;
    // Velocity, smoothed over the last few tens of milliseconds.
    let vx = 0;
    let vy = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let t0 = 0;

    const hint = (name: string) => root.querySelector<HTMLElement>(`[data-hint="${name}"]`);
    const hints = () => root.querySelectorAll<HTMLElement>("[data-hint]");

    const show = (el: HTMLElement | null, opacity: number, transform: string, on: boolean) => {
      if (!el) return;
      el.style.opacity = String(opacity);
      el.style.transform = transform;
      el.dataset.armed = String(on);
    };
    const hide = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.opacity = "0";
      el.dataset.armed = "false";
    };

    // A short tick as the swipe crosses into "letting go will do it". Android
    // only — iOS has no vibration API — and ignored before the first tap,
    // which is when browsers start allowing it.
    const arm = (on: boolean) => {
      if (on && !armed) {
        try {
          navigator.vibrate?.(8);
        } catch {
          // Not available: the hint filling in is the signal.
        }
      }
      armed = on;
    };

    function render() {
      const a = live.current;
      if (axis === "x") {
        const next = dx < 0;
        const allowed = next ? a.canNext : a.canPrev;
        const travel = Math.abs(dx);
        const p = Math.min(1, travel / COMMIT_X);
        const on = allowed && travel >= COMMIT_X;
        const chart = chartRef.current;
        if (chart) {
          const shift = allowed ? clamp(dx * FOLLOW, FOLLOW_MAX) : clamp(dx * BLOCKED, BLOCKED_MAX);
          chart.style.transform = `translate3d(${shift}px, 0, 0)`;
        }
        hide(hint(next ? "prev" : "next"));
        // Slides in from the edge the next or previous day lies behind.
        const off = `${(1 - p).toFixed(3)} * (100% + 16px)`;
        show(
          hint(next ? "next" : "prev"),
          allowed ? p : 0,
          `translate3d(calc(${next ? "" : "-1 * "}${off}), 0, 0)`,
          on,
        );
        arm(on);
      } else if (axis === "y") {
        const down = dy > 0;
        const travel = Math.abs(dy);
        const p = Math.min(1, travel / COMMIT_Y);
        const on = travel >= COMMIT_Y;
        hide(hint(down ? "up" : "down"));
        // Comes in from the edge the sheet will: the calendar from the top,
        // the info from the bottom.
        show(
          hint(down ? "down" : "up"),
          p,
          down
            ? `translate3d(0, calc(-100% + ${(p * HINT_Y).toFixed(1)}px), 0)`
            : `translate3d(0, calc(100% - ${(p * HINT_Y).toFixed(1)}px), 0)`,
          on,
        );
        arm(on);
      }
    }

    function end(commit: (() => void) | null) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      const chart = chartRef.current;
      if (chart && axis === "x") {
        chart.style.transition = "transform 180ms ease-out";
        chart.style.transform = "";
        window.setTimeout(() => {
          chart.style.transition = "";
          chart.style.willChange = "";
        }, 200);
      }
      hints().forEach((el) => {
        el.style.transition = "opacity 160ms ease-out";
        hide(el);
      });
      id = null;
      axis = null;
      armed = false;
      commit?.();
    }

    function onDown(e: PointerEvent) {
      if (e.pointerType !== "touch") return;
      // A second finger means a pinch or a fumble, never a swipe.
      if (id !== null) {
        end(null);
        return;
      }
      if (!live.current.enabled) return;
      const target = e.target as Element | null;
      if (!target || target.closest(NO_SWIPE)) return;
      id = e.pointerId;
      x0 = lastX = e.clientX;
      y0 = lastY = e.clientY;
      t0 = lastT = e.timeStamp;
      dx = dy = vx = vy = 0;
      axis = null;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    }

    function onMove(e: PointerEvent) {
      if (e.pointerId !== id) return;
      dx = e.clientX - x0;
      dy = e.clientY - y0;
      const dt = e.timeStamp - lastT;
      if (dt > 0) {
        const k = Math.min(1, dt / 50);
        vx = vx * (1 - k) + ((e.clientX - lastX) / dt) * k;
        vy = vy * (1 - k) + ((e.clientY - lastY) / dt) * k;
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;

      if (!axis) {
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        const m = Math.max(ax, ay);
        if (m < SLOP) return;
        if (ax > ay * LOCK) axis = "x";
        else if (ay > ax * LOCK) axis = "y";
        // Still diagonal well past the slop: take the larger, rather than
        // leave a finger that has plainly moved doing nothing.
        else if (m > SLOP * 3) axis = ax >= ay ? "x" : "y";
        else return;
        const chart = chartRef.current;
        if (chart && axis === "x") {
          chart.style.transition = "";
          chart.style.willChange = "transform";
        }
        hints().forEach((el) => {
          el.style.transition = "background-color 120ms, color 120ms, border-color 120ms";
        });
      }
      render();
    }

    /**
     * A flick: fast at the end, or fast throughout a short gesture — the
     * second because a browser that coalesces a quick swipe into two or three
     * events leaves too few samples to smooth. Never one that turned back:
     * its net travel is what is measured.
     */
    function flick(d: number, v: number, at: number) {
      if (Math.abs(d) < FLICK_MIN) return false;
      const late = Math.abs(v) >= FLICK_V && Math.sign(v) === Math.sign(d);
      const dur = at - t0;
      const brisk = dur <= 250 && Math.abs(d) / Math.max(1, dur) >= FLICK_V;
      return late || brisk;
    }

    function onUp(e: PointerEvent) {
      if (e.pointerId !== id) return;
      const a = live.current;
      let commit: (() => void) | null = null;
      if (axis === "x") {
        const next = dx < 0;
        const allowed = next ? a.canNext : a.canPrev;
        if (allowed && (Math.abs(dx) >= COMMIT_X || flick(dx, vx, e.timeStamp)))
          commit = next ? a.onNext : a.onPrev;
      } else if (axis === "y") {
        if (Math.abs(dy) >= COMMIT_Y || flick(dy, vy, e.timeStamp))
          commit = dy > 0 ? a.onDown : a.onUp;
      }
      end(commit);
    }

    function onCancel(e: PointerEvent) {
      if (e.pointerId !== id) return;
      end(null);
    }

    root.addEventListener("pointerdown", onDown);
    return () => {
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [rootRef, chartRef]);
}
