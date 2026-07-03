import type { TideExtreme } from "@/lib/api/tides.functions";

// A tide extreme expressed in the plot's local coordinates: `t` is hours since
// local midnight of the selected day, `h` the water height (m).
export type ExtremePoint = {
  t: number;
  h: number;
  high: boolean;
  coef: number | null;
};

export function extremesToPoints(extremes: TideExtreme[], selectedDate: Date): ExtremePoint[] {
  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  return extremes.map((e) => {
    const d = new Date(e.time);
    const t = (d.getTime() - dayStart.getTime()) / 3_600_000;
    return { t, h: e.level, high: e.high, coef: e.coefficient };
  });
}

// Progressive colour scale for the tide coefficient (20–120), à la maree.info:
// pale desaturated blue (small coef) → pale green/yellow (~70) → pale salmon
// (~80) → pale red darkening toward 120. Interpolated in HSL across stops.
const COEF_STOPS: [number, number, number, number][] = [
  // coef,  h,    s,   l
  [20, 210, 25, 94],
  [40, 200, 40, 89],
  [55, 150, 42, 87],
  [70, 72, 55, 85],
  [80, 26, 62, 82],
  [95, 8, 66, 75],
  [120, 2, 72, 58],
];

export function coefColor(coef: number): string {
  const c = Math.max(20, Math.min(120, coef));
  let a = COEF_STOPS[0];
  let b = COEF_STOPS[COEF_STOPS.length - 1];
  for (let i = 0; i < COEF_STOPS.length - 1; i++) {
    if (c >= COEF_STOPS[i][0] && c <= COEF_STOPS[i + 1][0]) {
      a = COEF_STOPS[i];
      b = COEF_STOPS[i + 1];
      break;
    }
  }
  const f = a[0] === b[0] ? 0 : (c - a[0]) / (b[0] - a[0]);
  const h = a[1] + (b[1] - a[1]) * f;
  const s = a[2] + (b[2] - a[2]) * f;
  const l = a[3] + (b[3] - a[3]) * f;
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
}

// Build a continuous tide-height function h(t) by cosine-easing between the
// day's extreme points (a smooth semi-diurnal approximation).
export function makeTideHeight(allPoints: ExtremePoint[]): (t: number) => number {
  if (allPoints.length < 2) return () => 5;
  return (t: number) => {
    if (t <= allPoints[0].t) return allPoints[0].h;
    if (t >= allPoints[allPoints.length - 1].t) return allPoints[allPoints.length - 1].h;
    for (let i = 0; i < allPoints.length - 1; i++) {
      const a = allPoints[i];
      const b = allPoints[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = (t - a.t) / (b.t - a.t);
        const eased = (1 - Math.cos(u * Math.PI)) / 2;
        return a.h + (b.h - a.h) * eased;
      }
    }
    return allPoints[allPoints.length - 1].h;
  };
}

// Map a tide height (m) to a vertical fraction (0 = image top, 1 = image
// bottom) via the calibration marks. Piecewise-linear between marks, and
// linearly extrapolated beyond the top and bottom marks using the nearest
// segment — this lets IRL use a 3-point calibration (10m, tether, 1m) so the
// photo's perspective is honoured, while BL/FOU (2 marks) stay perfectly linear.
export function heightToFrac(h: number, calib: { h: number; frac: number }[]): number {
  // Above the top mark: extrapolate with the first segment.
  if (h >= calib[0].h) {
    const a = calib[0];
    const b = calib[1];
    const slope = (b.frac - a.frac) / (b.h - a.h);
    return a.frac + slope * (h - a.h);
  }
  // Between two marks: interpolate within that segment.
  for (let i = 0; i < calib.length - 1; i++) {
    const a = calib[i];
    const b = calib[i + 1];
    if (h <= a.h && h >= b.h) {
      const u = (a.h - h) / (a.h - b.h);
      return a.frac + (b.frac - a.frac) * u;
    }
  }
  // Below the bottom mark: extrapolate with the last segment.
  const a = calib[calib.length - 2];
  const b = calib[calib.length - 1];
  const slope = (b.frac - a.frac) / (b.h - a.h);
  return b.frac + slope * (h - b.h);
}

// Inverse of heightToFrac: a vertical fraction of the image back to a tide
// height. Used to find the heights at the visible top/bottom edges of the
// plot (which differ from the image edges when the image overflows the screen).
export function fracToHeight(f: number, calib: { h: number; frac: number }[]): number {
  // Above the top mark (smaller frac): extrapolate with the first segment.
  if (f <= calib[0].frac) {
    const a = calib[0];
    const b = calib[1];
    const slope = (b.h - a.h) / (b.frac - a.frac);
    return a.h + slope * (f - a.frac);
  }
  // Between two marks.
  for (let i = 0; i < calib.length - 1; i++) {
    const a = calib[i];
    const b = calib[i + 1];
    if (f >= a.frac && f <= b.frac) {
      const u = (f - a.frac) / (b.frac - a.frac);
      return a.h + (b.h - a.h) * u;
    }
  }
  // Below the bottom mark (larger frac): extrapolate with the last segment.
  const a = calib[calib.length - 2];
  const b = calib[calib.length - 1];
  const slope = (b.h - a.h) / (b.frac - a.frac);
  return b.h + slope * (f - b.frac);
}

// Format an hours-since-midnight value as "HHhMM" (e.g. 6.5 -> "06h30").
export function fmtTime(t: number): string {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  const mm = m === 60 ? 0 : m;
  const hh = m === 60 ? h + 1 : h;
  return `${String(hh).padStart(2, "0")}h${String(mm).padStart(2, "0")}`;
}

// Format a duration in hours as "1h05" or "45 min".
export function fmtDuration(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return hh > 0 ? `${hh}h${String(mm).padStart(2, "0")}` : `${mm} min`;
}

export const DATE_MIN = new Date(2026, 5, 1); // June 2026
export const DATE_MAX = new Date(2028, 11, 31); // Dec 2028

// Shift a date by ±n days, preserving the time of day. Returns null when the
// result falls outside the allowed [DATE_MIN, DATE_MAX] range (so the < / >
// nav buttons can disable at the bounds).
export function shiftDay(date: Date, delta: number): Date | null {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  if (d < DATE_MIN || d > DATE_MAX) return null;
  return d;
}
