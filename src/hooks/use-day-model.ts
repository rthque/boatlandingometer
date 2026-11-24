import { useMemo } from "react";
import { format } from "date-fns";
import * as SunCalc from "suncalc";
import { getTideExtremes } from "@/lib/tides";
import { DATE_MIN, extremesToPoints, makeTideHeight, type ExtremePoint } from "@/lib/tide-math";
import { crestAbove, hsAtHour, type DayForecast } from "@/lib/forecast";
import { DIEPPE } from "@/lib/views";
import { useForecast } from "@/hooks/use-forecast";

/** Everything the chart draws that belongs to one day rather than to the structure. */
export type DayModel = {
  date: Date;
  /** yyyy-MM-dd: the page's identity in the touch carousel. */
  key: string;
  allExtremes: ExtremePoint[];
  visibleExtremes: ExtremePoint[];
  tideHeight: (t: number) => number;
  curvePath: string;
  seaPath: string;
  sunriseH: number | null;
  sunsetH: number | null;
  forecastDay: DayForecast | null;
  waveSeries: readonly (number | null)[] | null;
  /** The wave band is on and there is a forecast to draw it from. */
  waveOn: boolean;
  /** The red line is read against the crest: every hour of the day is covered. */
  waveAdjusted: boolean;
  /** What the red line is read against — the tide, or the wave crest. */
  levelAt: (t: number) => number;
  /** Where that level crosses the red line, in hours. */
  crossings: number[];
};

type Geo = {
  xOfT: (t: number) => number;
  yOfH: (h: number) => number;
  /** Changes whenever xOfT or yOfH would: the paths are re-cut on it. */
  key: string;
};

const NO_EXTREMES: ExtremePoint[] = [];

/**
 * One day's tide, sun and sea state, in plot space.
 *
 * The selected day always has one. On a phone, the days either side get one
 * too while a finger is on the chart, so a sideways swipe can slide them in
 * (see useSwipe). A null date returns null and costs nothing, which is what
 * the neighbours are the rest of the time — and always, on a mouse.
 *
 * Memoised on the date's instant, not on the Date object: the neighbours are
 * fresh objects for each selected day, and the sun times depend on the time
 * of day the date carries (SunCalc picks the nearest solar noon), so the
 * instant is the honest key.
 */
export function useDayModel(
  date: Date | null,
  geo: Geo,
  targetHeight: number | null,
  showWaves: boolean,
): DayModel | null {
  const ms = date ? date.getTime() : null;
  const live = ms !== null;

  const allExtremes = useMemo(() => {
    if (ms === null) return NO_EXTREMES;
    const d = new Date(ms);
    return extremesToPoints(getTideExtremes(format(d, "yyyy-MM-dd")).extremes, d);
  }, [ms]);

  const visibleExtremes = useMemo(
    () => allExtremes.filter((p) => p.t >= 0 && p.t <= 24),
    [allExtremes],
  );

  const tideHeight = useMemo(() => makeTideHeight(allExtremes), [allExtremes]);

  const curvePath = useMemo(() => {
    if (ms === null) return "";
    const steps = 960;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      const x = geo.xOfT(t);
      const y = geo.yOfH(tideHeight(t));
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.key, tideHeight, live]);

  const seaPath = useMemo(() => {
    if (ms === null) return "";
    const steps = 960;
    // Close the fill on chart datum, not on the bottom of the plot. This band
    // is the tide — the water that comes and goes — and below datum the scene's
    // permanent sea already has it covered. Running the fill to the bottom
    // painted a second, lighter water on top of the deep water and washed the
    // immersed legs out.
    const base = geo.yOfH(0).toFixed(2);
    let d = `M ${geo.xOfT(0).toFixed(2)} ${base}`;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      d += ` L ${geo.xOfT(t).toFixed(2)} ${geo.yOfH(tideHeight(t)).toFixed(2)}`;
    }
    d += ` L ${geo.xOfT(24).toFixed(2)} ${base} Z`;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.key, tideHeight, live]);

  // Sunrise / sunset for the day (SunCalc accounts for the date, so these
  // shift across the seasons over the whole year).
  const { sunriseH, sunsetH } = useMemo(() => {
    if (ms === null) return { sunriseH: null, sunsetH: null };
    const t = SunCalc.getTimes(new Date(ms), DIEPPE.latitude, DIEPPE.longitude);
    const toH = (d: Date | null | undefined) =>
      d && !Number.isNaN(d.getTime())
        ? d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
        : null;
    return { sunriseH: toH(t.sunrise), sunsetH: toH(t.sunset) };
  }, [ms]);

  // One request for the whole forecast window, shared by every caller: for
  // a neighbour this is a cache read, never a second fetch.
  const { day: forecast } = useForecast(date ?? DATE_MIN);
  const forecastDay = ms === null ? null : forecast;
  const waveSeries = useMemo(() => {
    const series = forecastDay?.waveHsByHour;
    return series && series.some((v) => v !== null) ? series : null;
  }, [forecastDay]);
  const waveOn = showWaves && waveSeries !== null;

  /**
   * What the red line is read against: the tide, or with the waves on, the
   * crest — so its crossing times and durations say when the biggest waves
   * clear that height, not when the still water does. Those durations are
   * shorter, and shorter is the true answer for wave-sensitive work.
   *
   * Only when the forecast covers every hour of the day. A level that is the
   * crest in some hours and the bare tide in others jumps where the forecast
   * stops, and the jump would read as a crossing nobody could meet. With a
   * gap the line stays on the tide, and its chips lose the wave mark that
   * says otherwise.
   */
  const waveAdjusted = waveOn && waveSeries !== null && waveSeries.every((v) => v !== null);
  const levelAt = useMemo(() => {
    if (!waveAdjusted || !waveSeries) return tideHeight;
    return (t: number) => tideHeight(t) + crestAbove(hsAtHour(waveSeries, t) ?? 0);
  }, [waveAdjusted, waveSeries, tideHeight]);

  // Times where the red line's level (the tide, or the crest with the waves
  // on) crosses targetHeight.
  const crossings = useMemo(() => {
    if (targetHeight === null || !live) return [];
    const steps = 2880; // 30s resolution
    const xs: number[] = [];
    let prev = levelAt(0) - targetHeight;
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * 24;
      const curr = levelAt(t) - targetHeight;
      if (prev === 0 || prev < 0 !== curr < 0) {
        const tPrev = ((i - 1) / steps) * 24;
        const u = prev === curr ? 0 : prev / (prev - curr);
        xs.push(tPrev + u * (24 / steps));
      }
      prev = curr;
    }
    return xs;
  }, [targetHeight, levelAt, live]);

  if (!date) return null;
  return {
    date,
    key: format(date, "yyyy-MM-dd"),
    allExtremes,
    visibleExtremes,
    tideHeight,
    curvePath,
    seaPath,
    sunriseH,
    sunsetH,
    forecastDay,
    waveSeries,
    waveOn,
    waveAdjusted,
    levelAt,
    crossings,
  };
}
