import { useMemo } from "react";
import type { PlotGeom } from "@/lib/geom";
import {
  ALT_FULL_SCALE,
  altitudeAt,
  moonLitPath,
  moonLook,
  moonPhaseName,
  rangeHint,
  skyTrack,
  type SkyPoint,
} from "@/lib/celestial";

type Props = {
  geom: PlotGeom;
  /** Where the drawn sea meets the sky. The band never reaches below it. */
  horizonY: number;
  date: Date;
  /** Hour of the day the bodies are shown at: the time-lapse clock, or now. */
  hour: number;
  lat: number;
  lon: number;
};

/**
 * How far down the plot the band may reach, as a fraction of its height.
 *
 * The horizon alone is not a usable floor: in the FOU view it sits at 4 m out
 * of 25, so anchoring to it would sweep the sun across five sixths of the
 * chart and turn an aside into the subject. Capping the band keeps the arcs in
 * the upper air, and each track fades out before reaching the floor, so no
 * false horizon is implied where the band happens to end.
 */
const BAND_FRAC = 0.44;

/**
 * Where the band starts, as a fraction of the plot.
 *
 * Not the very top. Both upper corners of this UI are taken — the tide
 * extremes on the left, the control stack on the right — and both are HTML
 * drawn above the SVG, so anything climbing into them goes behind them.
 * Starting lower does not make a high moon on a wide screen impossible, but it
 * makes it the exception rather than most evenings.
 */
const BAND_TOP_FRAC = 0.1;

/** Half-hour steps: an arc is smooth well before this, and it halves the work. */
const STEPS = 48;

const SUN_R = 13;
const MOON_R = 11.5;

/**
 * The bodies move on every frame of a time-lapse, over a structure drawn
 * through SVG filters. Promoting each to its own layer means moving it no
 * longer invalidates the filtered image underneath — the same fix that was
 * worth about 4 fps on the water group. Kept as a constant so both share one
 * object rather than allocating a fresh style every frame.
 */
const MOVING = { willChange: "transform" } as const;

/** The band's vertical mapping, or null when there is too little sky to draw in. */
function useBand(geom: PlotGeom, horizonY: number) {
  const { PAD_T, plotHeight } = geom;
  const top = PAD_T + plotHeight * BAND_TOP_FRAC;
  const floor = Math.min(horizonY, PAD_T + plotHeight * BAND_FRAC);
  const band = floor - top;
  // Too little air — happens in the BL view at the top of a spring tide, where
  // the waterline has climbed most of the way up the plot.
  if (band < 46) return null;
  return (alt: number) => floor - (Math.min(alt, ALT_FULL_SCALE) / ALT_FULL_SCALE) * band;
}

/*
 * WHY THIS IS TWO LAYERS
 *
 * The x axis of this chart is the hour of the day, not a direction. So when
 * the sun's 09:00 position lands on the drawing of the jacket, the sun is not
 * "behind the structure" in any physical sense — 09:00 simply maps to an x the
 * drawing happens to occupy. Occlusion there means nothing, and the first
 * version, which drew everything behind the structure on the theory that it
 * was the honest order, hid the sun for most of the morning for no reason at
 * all.
 *
 * So the layering is chosen for legibility, and it is different for the two
 * parts:
 *
 * - SkyTracks go BEHIND the structure. They are context, thin, and long; drawn
 *   in front they would be lines across the subject. Behind, they still show
 *   through the lattice and run clear outside it.
 * - SkyBodies go IN FRONT. They are the thing you watch move, they are small,
 *   and a disc you cannot see teaches nothing.
 */

/**
 * The day's path of the sun and of the moon, on the chart's own time axis.
 *
 * The teaching is in where the two arcs peak, not in any label. Both ride the
 * same x axis as the tide below, so the horizontal gap between the sun's
 * highest point and the moon's is their separation in the sky: the same hour
 * at new moon, twelve hours apart at full, six at the quarters. That gap
 * opening and closing over a fortnight is spring and neap tides — the very
 * thing the coefficient chips on the extremes are already counting.
 */
export function SkyTracks({ geom, horizonY, date, lat, lon }: Props) {
  const yOfAlt = useBand(geom, horizonY);
  const tracks = useMemo(
    () => ({
      sun: skyTrack("sun", date, lat, lon, STEPS),
      moon: skyTrack("moon", date, lat, lon, STEPS),
    }),
    [date, lat, lon],
  );
  if (!yOfAlt) return null;
  const { xOfT } = geom;

  /**
   * One run of sky as a stroked path, faded out at both ends.
   *
   * The first attempt drew a dot every half hour. Sparse marks do not read as a
   * trajectory — against a sky gradient and a yellow lattice they read as dust.
   * A line says "path"; the fade keeps it from asserting a horizon.
   */
  const paths = (runs: SkyPoint[][], id: string, stroke: string) =>
    runs
      .filter((run) => run.length > 1)
      .map((run, ri) => {
        const d = run.map((p, i) => `${i ? "L" : "M"}${xOfT(p.t)},${yOfAlt(p.alt)}`).join(" ");
        const gid = `skyFade-${id}-${ri}`;
        return (
          <g key={gid}>
            <defs>
              {/* userSpaceOnUse so the fade follows the run's own span; the
                  bounding box of an arc would put the stops in the wrong place. */}
              <linearGradient
                id={gid}
                gradientUnits="userSpaceOnUse"
                x1={xOfT(run[0].t)}
                y1={0}
                x2={xOfT(run[run.length - 1].t)}
                y2={0}
              >
                <stop offset="0%" stopColor={stroke} stopOpacity={0} />
                <stop offset="18%" stopColor={stroke} stopOpacity={0.8} />
                <stop offset="82%" stopColor={stroke} stopOpacity={0.8} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Cased, the way the tide curve is over water. The casing is DARK
                by day on purpose: a pale one was tried first and only fogged
                the amber, because the sky and the steel are both pale. */}
            <path
              d={d}
              fill="none"
              stroke="var(--sky-track-casing)"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.3}
            />
            <path
              d={d}
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          </g>
        );
      });

  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      {paths(tracks.sun, "sun", "var(--sky-sun)")}
      {paths(tracks.moon, "moon", "var(--sky-moon-track)")}
    </g>
  );
}

/** The sun and the moon where they are at `hour`, the moon in its true phase. */
export function SkyBodies({ geom, horizonY, date, hour, lat, lon }: Props) {
  const yOfAlt = useBand(geom, horizonY);
  const look = useMemo(() => moonLook(date, hour), [date, hour]);
  if (!yOfAlt) return null;
  const { xOfT } = geom;

  const sunAlt = altitudeAt("sun", date, hour, lat, lon);
  const moonAlt = altitudeAt("moon", date, hour, lat, lon);
  const x = xOfT(hour);

  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      {sunAlt > 0 && (
        <g transform={`translate(${x}, ${yOfAlt(sunAlt)})`} style={MOVING}>
          <title>{`Sun — ${sunAlt.toFixed(0)}° above the horizon`}</title>
          {/* Three passes and a core. The sun has no edge, so it gets no
              outline: the halo is what makes it read as light, not a sticker. */}
          <circle r={SUN_R * 2.3} fill="var(--sky-sun)" opacity={0.1} />
          <circle r={SUN_R * 1.45} fill="var(--sky-sun)" opacity={0.22} />
          <circle r={SUN_R} fill="var(--sky-sun)" />
          <circle r={SUN_R * 0.38} fill="var(--sky-sun-core)" />
        </g>
      )}

      {/* Drawn after the sun: near new moon the two coincide, and the moon is
          the one between us and the sun — so it is the one on top. */}
      {moonAlt > 0 && (
        <g transform={`translate(${x}, ${yOfAlt(moonAlt)})`} style={MOVING}>
          <title>
            {`${moonPhaseName(look)}, ${(look.fraction * 100).toFixed(0)}% lit — ${rangeHint(look)}`}
          </title>
          {/* The unlit disc first, faintly: without it a thin crescent reads as
              a stray mark rather than a sphere with its night side to us. */}
          <circle r={MOON_R} fill="var(--sky-moon-dark)" opacity={0.55} />
          <path
            d={moonLitPath(MOON_R, look.phase)}
            fill="var(--sky-moon)"
            transform={look.waxing ? undefined : "scale(-1,1)"}
          />
          {/* A hairline round the whole disc. Without it a nearly-new moon is a
              pale smudge on a pale day sky and a nearly-full one dissolves into
              a dark night sky: the edge keeps it a sphere in both. */}
          <circle r={MOON_R} fill="none" stroke="var(--sky-moon-edge)" strokeWidth={0.9} />
        </g>
      )}
    </g>
  );
}
