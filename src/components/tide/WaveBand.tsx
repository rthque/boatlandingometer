import { useMemo } from "react";
import type { PlotGeom } from "@/lib/geom";
import { crestAbove, hsAtHour } from "@/lib/forecast";

type Props = {
  geom: PlotGeom;
  tideHeight: (t: number) => number;
  /** The day's 24 hourly Hs values, index = hour, null where there is none. */
  series: readonly (number | null)[];
};

/** Every six minutes: Hs is hourly and the tide is smooth, so this is ample. */
const STEPS = 240;

type Pt = { t: number; tide: number; crest: number };

/**
 * The band split into the runs where there is a forecast.
 *
 * A missing hour ends a run rather than being bridged — a gap in the band says
 * "no forecast here", which is true; joining across it would draw a sea state
 * the model never gave.
 */
function useRuns(tideHeight: Props["tideHeight"], series: Props["series"]): Pt[][] {
  return useMemo(() => {
    const runs: Pt[][] = [];
    let run: Pt[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = (i / STEPS) * 24;
      const hs = hsAtHour(series, t);
      if (hs === null) {
        if (run.length > 1) runs.push(run);
        run = [];
        continue;
      }
      run.push({ t, tide: tideHeight(t), crest: crestAbove(hs) });
    }
    if (run.length > 1) runs.push(run);
    return runs;
  }, [tideHeight, series]);
}

/**
 * The water's reach as the biggest waves pass: a band from the tide minus the
 * crest height to the tide plus it.
 *
 * A band and not a single line above the curve, because a line invites reading
 * it as where the water *sits*. The band says the surface swings through this
 * range, centred on the tide — which is also why it is symmetric: a wave's
 * height is trough to crest, so half of it is below the tide level.
 *
 * Drawn UNDER the tide curve, so the measured thing stays on top and crisp.
 */
export function WaveBandFill({ geom, tideHeight, series }: Props) {
  const runs = useRuns(tideHeight, series);
  const { xOfT, yOfH } = geom;
  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      {runs.map((run, i) => {
        const up = run.map(
          (p, j) => `${j ? "L" : "M"}${xOfT(p.t).toFixed(1)},${yOfH(p.tide + p.crest).toFixed(1)}`,
        );
        const down = [...run]
          .reverse()
          .map((p) => `L${xOfT(p.t).toFixed(1)},${yOfH(p.tide - p.crest).toFixed(1)}`);
        return (
          <g key={i}>
            <path d={`${up.join(" ")} ${down.join(" ")} Z`} fill="var(--wave-band-fill)" />
            {/* The trough edge, faint: enough to give the band a lower limit,
                not enough to compete with the crest, which is the answer. */}
            <path
              d={[...run]
                .map(
                  (p, j) =>
                    `${j ? "L" : "M"}${xOfT(p.t).toFixed(1)},${yOfH(p.tide - p.crest).toFixed(1)}`,
                )
                .join(" ")}
              fill="none"
              stroke="var(--wave-crest)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.55}
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * The crest edge — the highest the water is estimated to reach at each hour.
 * This is the line the button exists for, so it is drawn OVER the tide curve,
 * cased so it holds against sky, steel and water alike.
 */
export function WaveCrest({ geom, tideHeight, series }: Props) {
  const runs = useRuns(tideHeight, series);
  const { xOfT, yOfH } = geom;
  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      {runs.map((run, i) => {
        const d = run
          .map(
            (p, j) =>
              `${j ? "L" : "M"}${xOfT(p.t).toFixed(1)},${yOfH(p.tide + p.crest).toFixed(1)}`,
          )
          .join(" ");
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke="var(--wave-crest-casing)"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <path
              d={d}
              fill="none"
              stroke="var(--wave-crest)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}
