// Where the sun and the moon are in the sky over the site, and what shape the
// moon is. Pure computation, no React, no network — same contract as tides.ts.
//
// This exists to make the *cause* of the tide visible next to its effect. The
// plot's x axis is already the hour of the day, so a body drawn at its own hour
// lands directly above the water it is pulling, and the horizontal gap between
// the sun's track and the moon's IS their alignment: together at new moon,
// opposite at full, a quarter of the chart apart at the quarters. That gap
// opening and closing is spring and neap tides, drawn without a word of
// explanation.

import * as SunCalc from "suncalc";

/**
 * UNITS: this build of suncalc returns DEGREES, and azimuth measured clockwise
 * from north — not the radians-from-south of the API most references describe.
 *
 * Verified rather than assumed, against geometry that cannot be argued with:
 * solar noon altitude at this latitude must be 90 - lat ± 23.44 at the
 * solstices, and it comes back 63.3° and 16.4° against a predicted 63.3° and
 * 16.4°; the equinox sun rises at azimuth 89° and sets at 271°. If a future
 * bump makes the arcs collapse to a flat line, this is the first thing to
 * re-check — radians would read as a fraction of a degree and clamp to zero.
 */
/**
 * Altitude that reaches the top of the drawn band.
 *
 * Not 90°: at this latitude nothing gets near the zenith. The sun's ceiling is
 * 63.3° at midsummer and the moon's is a little over that, so scaling to 90
 * would waste a third of the band and flatten every arc. 65 lets a midsummer
 * noon just touch the top, which is the right thing for the one day a year it
 * happens.
 */
export const ALT_FULL_SCALE = 65;

export type SkyPoint = { t: number; alt: number };

/** The local wall-clock Date for hour `h` of `date`. */
export function atHour(date: Date, h: number): Date {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  // Built from components rather than by adding milliseconds: on the two days a
  // year the clocks change, adding 3600000 ms does not add an hour of local
  // time, and the arc would kink.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0);
}

/** Altitude in degrees above the horizon; negative means below it. */
export function altitudeAt(
  body: "sun" | "moon",
  date: Date,
  h: number,
  lat: number,
  lon: number,
): number {
  const at = atHour(date, h);
  const p =
    body === "sun" ? SunCalc.getPosition(at, lat, lon) : SunCalc.getMoonPosition(at, lat, lon);
  return p.altitude; // already degrees — see the UNITS note above
}

/**
 * The day's path, sampled, split into the runs where the body is actually up.
 *
 * Runs rather than one array because the moon routinely sets and rises again
 * inside the same calendar day, and joining those with a straight line would
 * draw it skimming along the horizon for hours it was not there.
 */
export function skyTrack(
  body: "sun" | "moon",
  date: Date,
  lat: number,
  lon: number,
  steps = 96,
): SkyPoint[][] {
  const runs: SkyPoint[][] = [];
  let run: SkyPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 24;
    const alt = altitudeAt(body, date, t, lat, lon);
    if (alt > 0) run.push({ t, alt });
    else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs;
}

export type MoonLook = {
  /** 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  phase: number;
  /** Lit fraction of the disc, 0–1. */
  fraction: number;
  waxing: boolean;
};

export function moonLook(date: Date, h: number): MoonLook {
  const i = SunCalc.getMoonIllumination(atHour(date, h));
  return { phase: i.phase, fraction: i.fraction, waxing: !!i.waxing };
}

export function moonPhaseName({ fraction, waxing }: MoonLook): string {
  if (fraction < 0.02) return "New moon";
  if (fraction > 0.98) return "Full moon";
  if (Math.abs(fraction - 0.5) < 0.06) return waxing ? "First quarter" : "Last quarter";
  if (fraction < 0.5) return waxing ? "Waxing crescent" : "Waning crescent";
  return waxing ? "Waxing gibbous" : "Waning gibbous";
}

/**
 * What the phase says about the range of the tides, which is the whole reason
 * the moon is drawn at all.
 *
 * Phase is the sun–moon angle seen from Earth, so it reads straight off as
 * alignment: new and full mean the two pulls line up and add (spring tides,
 * high coefficients), the quarters mean they pull at right angles and partly
 * cancel (neaps). Nothing here is a prediction — the coefficient chips on the
 * extremes are the measured thing; this only names why they move.
 */
export function rangeHint({ phase }: MoonLook): string {
  const toAligned = Math.min(phase, Math.abs(phase - 0.5), 1 - phase); // 0 at new/full
  if (toAligned < 0.06) return "sun and moon aligned — spring tides, the biggest range";
  if (toAligned > 0.19) return "sun and moon square — neap tides, the smallest range";
  return toAligned < 0.125
    ? "approaching alignment — range building"
    : "approaching square — range easing";
}

/**
 * SVG path for the lit part of a moon of radius r, centred on the origin.
 *
 * Two arcs: the bright limb (a semicircle) and the terminator (a semi-ellipse
 * whose horizontal semi-axis is r·cos(2π·phase)). At the quarters that cosine
 * is zero and the terminator is the straight line everyone draws; it bulges
 * away for a crescent and across the centre for a gibbous, which is what makes
 * the shape read as a sphere rather than a pie slice.
 *
 * Always drawn lit-on-the-right. A waning moon is that same shape seen the
 * other way round, so the caller mirrors it with a scale(-1,1) transform rather
 * than this building a second path: one shape, one place it can be wrong.
 */
export function moonLitPath(r: number, phase: number): string {
  const a = r * Math.cos(2 * Math.PI * phase);
  const sweep = a > 0 ? 0 : 1;
  return (
    `M 0,${-r} A ${r},${r} 0 0 1 0,${r} ` +
    `A ${Math.abs(a).toFixed(3)},${r} 0 0 ${sweep} 0,${-r} Z`
  );
}
