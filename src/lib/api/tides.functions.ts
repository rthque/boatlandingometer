import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type TideExtreme = {
  time: string;
  level: number;
  high: boolean;
  coefficient: number | null;
};

// "Coefficient de marée" (French tidal coefficient) is a Brest-referenced
// number, linear in the semi-diurnal amplitude, scaled so the lowest possible
// tide = 20 and the highest = 120. A_MIN / A_MAX are the extreme Brest
// half-ranges over a full 18.6-year nodal cycle, computed empirically from the
// same `neaps` predictor (see scripts/calibration).
const BREST = { latitude: 48.3828, longitude: -4.4953 };
const A_MIN = 0.6963; // m  -> coefficient 20
const A_MAX = 3.7056; // m  -> coefficient 120

const coefFromAmplitude = (halfRange: number) => {
  const c = 20 + 100 * ((halfRange - A_MIN) / (A_MAX - A_MIN));
  return Math.round(Math.max(20, Math.min(120, c)));
};

type Extreme = { time: Date; level: number; high: boolean };

// Coefficient of each Brest high water = amplitude (half of the mean of its two
// neighbouring low-water ranges), mapped onto the 20–120 scale.
function brestCoefficients(
  getExtremesPrediction: (opts: {
    latitude: number;
    longitude: number;
    start: Date;
    end: Date;
  }) => { extremes: Extreme[] },
  start: Date,
  end: Date,
) {
  const pred = getExtremesPrediction({ ...BREST, start, end });
  const ex: Extreme[] = pred.extremes.map(
    (e: { time: Date; level: number; high: boolean }) => ({
      time: e.time,
      level: e.level,
      high: e.high,
    }),
  );
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

export const getTideExtremes = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data }) => {
    const { getExtremesPrediction } = await import("neaps");

    const dayStart = new Date(`${data.date}T00:00:00+02:00`);
    const dayEnd = new Date(`${data.date}T23:59:59+02:00`);
    const start = new Date(dayStart.getTime() - 8 * 3600_000);
    const end = new Date(dayEnd.getTime() + 8 * 3600_000);

    const prediction = getExtremesPrediction({
      latitude: 49.9253,
      longitude: 1.0758,
      start,
      end,
    });

    // Brest coefficients over the same window; each Dieppe extreme inherits the
    // coefficient of the nearest-in-time Brest high water (a coefficient
    // characterises a whole tide cycle, so PM and the adjacent BM share it).
    const coefs = brestCoefficients(getExtremesPrediction, start, end);
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

    const extremes: TideExtreme[] = prediction.extremes.map(
      (e: { time: Date; level: number; high: boolean }) => ({
        time: e.time.toISOString(),
        level: e.level,
        high: e.high,
        coefficient: coefAt(e.time.getTime()),
      }),
    );

    return { extremes };
  });

// Brest high-water coefficients over an arbitrary date range — used to colour
// the calendar (one coefficient per high water; the client bins them per local
// day, keeping the day's maximum).
export const getTideCoefficients = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data }) => {
    const { getExtremesPrediction } = await import("neaps");
    const start = new Date(`${data.start}T00:00:00+02:00`);
    const end = new Date(`${data.end}T23:59:59+02:00`);
    const highs = brestCoefficients(
      getExtremesPrediction,
      new Date(start.getTime() - 8 * 3600_000),
      new Date(end.getTime() + 8 * 3600_000),
    );
    return {
      highs: highs.map((h) => ({
        time: new Date(h.time).toISOString(),
        coef: h.coef,
      })),
    };
  });
