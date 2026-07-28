// Aliased: `useStation` is a plain factory, not a React hook, but the `use`
// prefix trips react-hooks/rules-of-hooks at module scope.
import { useStation as createStationPredictor } from "@neaps/tide-predictor";

import stations from "./stations.json";

// Tide prediction runs entirely in the browser. The two stations we need are
// baked into stations.json by scripts/extract-stations.mjs, so we never ship
// the ~24 MB global station database. See that script for how to refresh them.

export type TideExtreme = {
  time: string;
  level: number;
  high: boolean;
  coefficient: number | null;
};

// `Station` in @neaps/tide-database carries a few extra fields (license, epoch)
// that the predictor's own Station type doesn't declare. The shapes are
// otherwise identical, so a structural cast is safe here.
type PredictorStation = Parameters<typeof createStationPredictor>[0];

const dieppe = createStationPredictor(stations.dieppe as unknown as PredictorStation);
const brest = createStationPredictor(stations.brest as unknown as PredictorStation);

// "Coefficient de marée" (French tidal coefficient) is a Brest-referenced
// number, linear in the semi-diurnal amplitude, scaled so the lowest possible
// tide = 20 and the highest = 120. A_MIN / A_MAX are the extreme Brest
// half-ranges over a full 18.6-year nodal cycle, computed empirically from the
// same predictor (see scripts/calibration).
const A_MIN = 0.6963; // m  -> coefficient 20
const A_MAX = 3.7056; // m  -> coefficient 120

const coefFromAmplitude = (halfRange: number) => {
  const c = 20 + 100 * ((halfRange - A_MIN) / (A_MAX - A_MIN));
  return Math.round(Math.max(20, Math.min(120, c)));
};

type Extreme = { time: Date; level: number; high: boolean };

// Coefficient of each Brest high water = amplitude (half of the mean of its two
// neighbouring low-water ranges), mapped onto the 20–120 scale.
function brestCoefficients(start: Date, end: Date) {
  const ex: Extreme[] = brest
    .getExtremesPrediction({ start, end })
    .extremes.map((e) => ({ time: e.time, level: e.level, high: e.high }));

  const highs: { time: number; coef: number }[] = [];
  for (let i = 0; i < ex.length; i++) {
    if (!ex[i].high) continue;
    const lows: number[] = [];
    if (ex[i - 1] && !ex[i - 1].high) lows.push(ex[i - 1].level);
    if (ex[i + 1] && !ex[i + 1].high) lows.push(ex[i + 1].level);
    if (!lows.length) continue;
    const lowMean = lows.reduce((a, b) => a + b, 0) / lows.length;
    const halfRange = (ex[i].level - lowMean) / 2;
    highs.push({ time: ex[i].time.getTime(), coef: coefFromAmplitude(halfRange) });
  }
  return highs;
}

/** Dieppe extremes for one local day, padded by 8 h on each side. */
export function getTideExtremes(date: string): { extremes: TideExtreme[] } {
  const dayStart = new Date(`${date}T00:00:00+02:00`);
  const dayEnd = new Date(`${date}T23:59:59+02:00`);
  const start = new Date(dayStart.getTime() - 8 * 3600_000);
  const end = new Date(dayEnd.getTime() + 8 * 3600_000);

  const prediction = dieppe.getExtremesPrediction({ start, end });

  // Brest coefficients over the same window; each Dieppe extreme inherits the
  // coefficient of the nearest-in-time Brest high water (a coefficient
  // characterises a whole tide cycle, so PM and the adjacent BM share it).
  const coefs = brestCoefficients(start, end);
  const coefAt = (t: number): number | null => {
    if (!coefs.length) return null;
    let best = coefs[0];
    let bestDiff = Math.abs(coefs[0].time - t);
    for (const c of coefs) {
      const d = Math.abs(c.time - t);
      if (d < bestDiff) {
        bestDiff = d;
        best = c;
      }
    }
    return best.coef;
  };

  const extremes: TideExtreme[] = prediction.extremes.map((e) => ({
    time: e.time.toISOString(),
    level: e.level,
    high: e.high,
    coefficient: coefAt(e.time.getTime()),
  }));

  return { extremes };
}

// Brest high-water coefficients over an arbitrary date range — used to colour
// the calendar (one coefficient per high water; the client bins them per local
// day, keeping the day's maximum).
export function getTideCoefficients(
  startDate: string,
  endDate: string,
): { highs: { time: string; coef: number }[] } {
  const start = new Date(`${startDate}T00:00:00+02:00`);
  const end = new Date(`${endDate}T23:59:59+02:00`);
  const highs = brestCoefficients(
    new Date(start.getTime() - 8 * 3600_000),
    new Date(end.getTime() + 8 * 3600_000),
  );
  return {
    highs: highs.map((h) => ({
      time: new Date(h.time).toISOString(),
      coef: h.coef,
    })),
  };
}
