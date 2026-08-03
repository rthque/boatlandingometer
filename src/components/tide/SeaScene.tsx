import { useMemo } from "react";
import type { PlotGeom } from "@/lib/geom";

// The world the structure stands in: sky above chart datum, sea below it.
//
// The waterline is yOfH(0) — chart datum, the level the tide is measured from.
// That is a real choice, not decoration: everything the scene draws below that
// line is water that is genuinely always there, so the legs reading as immersed
// is true rather than staged. The day's tide rides on top of it as the existing
// curve fill.
//
// Every colour comes from a CSS custom property so one component serves both
// themes; see the --sky-* / --sea-* / --star-* tokens in styles.css.

type Props = {
  geom: PlotGeom;
  /**
   * Screen y of the distant horizon. The sea is a plane receding away from the
   * viewer, so its far edge sits at eye level — well above the point where it
   * touches the structure. Without this the sea would be the thin sliver below
   * chart datum and the view would read as a diagram, not a place.
   */
  horizonY: number;
  /** Screen y of chart datum — where the sea meets the structure. */
  waterY: number;
};

// Deterministic PRNG so the star field is stable across re-renders and resizes.
function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; r: number; o: number; bright: boolean };

// Positions are normalised (0..1 across the plot, 0..1 down the sky band) so
// they never need regenerating when the viewport changes.
const STARS: Star[] = (() => {
  const rand = mulberry32(0x5eaf1a7e);
  const out: Star[] = [];
  for (let i = 0; i < 220; i++) {
    const x = rand();
    // Bias upward: the atmosphere washes stars out near the horizon.
    const y = rand() ** 1.7;
    const bright = rand() > 0.93;
    out.push({
      x,
      y,
      r: bright ? 1.1 + rand() * 0.9 : 0.35 + rand() * 0.75,
      // Fade toward the horizon on top of the positional bias.
      o: (0.25 + rand() * 0.75) * (0.35 + 0.65 * (1 - y)),
      bright,
    });
  }
  return out;
})();

export function SceneDefs({ geom, horizonY, waterY }: Props) {
  const { PAD_T, plotHeight } = geom;
  const skyTop = PAD_T;
  const skyBottom = Math.max(skyTop + 1, horizonY);
  const seaBottom = PAD_T + plotHeight;

  return (
    <>
      <linearGradient
        id="skyGrad"
        x1="0"
        x2="0"
        y1={skyTop}
        y2={skyBottom}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" style={{ stopColor: "var(--sky-top)" }} />
        <stop offset="55%" style={{ stopColor: "var(--sky-mid)" }} />
        <stop offset="100%" style={{ stopColor: "var(--sky-horizon)" }} />
      </linearGradient>

      <linearGradient
        id="seaGradScene"
        x1="0"
        x2="0"
        y1={skyBottom}
        y2={seaBottom}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" style={{ stopColor: "var(--sea-top)" }} />
        <stop offset="100%" style={{ stopColor: "var(--sea-deep)" }} />
      </linearGradient>

      {/* Light gathering on the horizon — the single brightest thing in the
          night composition, and what the water shimmer answers to. */}
      <radialGradient id="horizonGlow" cx="0.5" cy="1" r="0.75">
        <stop offset="0%" style={{ stopColor: "var(--horizon-glow)" }} />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>

      {/* Veil drawn OVER the immersed part of the structure so the legs sit in
          the water rather than behind it. Anchored on chart datum, not the
          horizon, because that is where the structure actually enters the sea. */}
      <linearGradient
        id="waterVeil"
        x1="0"
        x2="0"
        y1={waterY}
        y2={seaBottom}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" style={{ stopColor: "var(--veil-shallow)" }} />
        <stop offset="100%" style={{ stopColor: "var(--veil-deep)" }} />
      </linearGradient>

      {/* Night grade: pull the fluorescent yellow down to the khaki a floodlit
          deck reads as after dark.

          Deliberately `saturate` + a per-channel curve rather than a hand-mixed
          colour matrix. Mixing channels rotates hues, which turned the red
          "23m"/"10m"/"0m" calibration marks printed on the render olive — and
          those marks are the whole point of the drawing. Desaturating and
          darkening keeps red red while the yellow goes khaki. */}
      <filter id="nightGrade" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0.62" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.62" intercept="0.03" />
          <feFuncG type="linear" slope="0.62" intercept="0.03" />
          <feFuncB type="linear" slope="0.7" intercept="0.09" />
        </feComponentTransfer>
      </filter>

      {/* Same idea pushed further for what is underwater: colder, darker, and
          softened the way suspended sediment does it. */}
      <filter id="submergedGrade" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0.38" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.4" intercept="0.02" />
          <feFuncG type="linear" slope="0.44" intercept="0.05" />
          <feFuncB type="linear" slope="0.52" intercept="0.11" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="0.7" />
      </filter>

      {/* Day: the render is lit for a white page, so it is too hot against sky
          and sea. A touch of desaturation is all it needs. */}
      <filter id="dayGrade" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0.92" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.97" intercept="0.01" />
          <feFuncG type="linear" slope="0.97" intercept="0.01" />
          <feFuncB type="linear" slope="0.98" intercept="0.02" />
        </feComponentTransfer>
      </filter>

      <filter id="daySubmerged" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0.55" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.62" intercept="0.02" />
          <feFuncG type="linear" slope="0.7" intercept="0.06" />
          <feFuncB type="linear" slope="0.78" intercept="0.12" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="0.6" />
      </filter>
    </>
  );
}

/** Sky, stars and the sea body — drawn behind the structure. */
export function SkyLayer({ geom, horizonY }: Props) {
  const { PAD_L, PAD_T, plotWidth, plotHeight } = geom;
  const skyH = Math.max(0, horizonY - PAD_T);
  const seaH = Math.max(0, PAD_T + plotHeight - horizonY);

  const stars = useMemo(
    () =>
      STARS.map((s, i) => ({
        key: i,
        cx: PAD_L + s.x * plotWidth,
        cy: PAD_T + s.y * skyH,
        r: s.r,
        o: s.o,
        bright: s.bright,
      })),
    [PAD_L, PAD_T, plotWidth, skyH],
  );

  // Streaks of reflected light on the water, tightest just below the surface
  // and stretching as they recede — the cue that reads as "sea" rather than
  // "blue rectangle".
  const streaks = useMemo(() => {
    const rand = mulberry32(0x1d3a77c1);
    const out: { y: number; x: number; w: number; h: number; o: number }[] = [];
    for (let i = 0; i < 46; i++) {
      const d = rand() ** 1.5; // 0 at the surface, 1 at the bottom
      // Near the horizon the streaks are short and tight; closer to the viewer
      // they stretch and separate. That gradient is the perspective cue.
      const w = plotWidth * (0.03 + rand() * 0.16) * (0.4 + 1.4 * d);
      out.push({
        y: horizonY + d * seaH,
        x: PAD_L + rand() * (plotWidth - w),
        w,
        h: 0.8 + d * 2.6,
        o: (0.55 - 0.4 * d) * (0.35 + rand() * 0.65),
      });
    }
    return out;
  }, [PAD_L, plotWidth, horizonY, seaH]);

  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      <rect x={PAD_L} y={PAD_T} width={plotWidth} height={skyH} fill="url(#skyGrad)" />

      <g style={{ opacity: "var(--star-opacity)" }}>
        {stars.map((s) => (
          <circle key={s.key} cx={s.cx} cy={s.cy} r={s.r} fill="var(--star-color)" opacity={s.o} />
        ))}
        {/* A few stars get a halo so the field has depth instead of reading as
            uniform noise. */}
        {stars
          .filter((s) => s.bright)
          .map((s) => (
            <circle
              key={`glow-${s.key}`}
              cx={s.cx}
              cy={s.cy}
              r={s.r * 3.4}
              fill="var(--star-color)"
              opacity={s.o * 0.16}
            />
          ))}
      </g>

      {/* Horizon light, anchored on the waterline. */}
      <rect
        x={PAD_L}
        y={PAD_T + skyH * 0.45}
        width={plotWidth}
        height={skyH * 0.55 + 2}
        fill="url(#horizonGlow)"
      />

      <rect x={PAD_L} y={horizonY} width={plotWidth} height={seaH} fill="url(#seaGradScene)" />

      <g style={{ opacity: "var(--shimmer-opacity)" }}>
        {streaks.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx={s.h / 2}
            fill="var(--shimmer-color)"
            opacity={s.o}
          />
        ))}
      </g>
    </g>
  );
}

/**
 * The water in FRONT of the immersed structure, plus the surface itself.
 * Drawn after the schema so the legs are seen through the sea, not beside it.
 */
export function WaterVeil({ geom, waterY }: Omit<Props, "horizonY">) {
  const { PAD_L, PAD_T, plotWidth, plotHeight } = geom;
  const seaH = Math.max(0, PAD_T + plotHeight - waterY);
  if (seaH <= 0) return null;

  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      <rect x={PAD_L} y={waterY} width={plotWidth} height={seaH} fill="url(#waterVeil)" />
      {/* The surface line: a bright meniscus over a soft shadow, which is what
          sells the waterline as a plane rather than an edge. */}
      <rect
        x={PAD_L}
        y={waterY - 0.5}
        width={plotWidth}
        height={1.6}
        fill="var(--surface-line)"
        opacity={0.9}
      />
      <rect
        x={PAD_L}
        y={waterY + 1.1}
        width={plotWidth}
        height={3}
        fill="var(--surface-shadow)"
        opacity={0.5}
      />
    </g>
  );
}
