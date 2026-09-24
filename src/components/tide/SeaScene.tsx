import { useMemo } from "react";
import type { PlotGeom } from "@/lib/geom";
import type { Theme } from "@/hooks/use-theme";
import { useImageRatio } from "@/hooks/use-image-ratio";
import {
  DAY_SEA_HORIZON_FRAC,
  DAY_SEA_IMG,
  NIGHT_SEA_HORIZON_FRAC,
  NIGHT_SEA_IMG,
} from "@/lib/views";

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
  /**
   * Screen y of the sea surface. Chart datum in the drawn scene; the red
   * height line in the photographic day scene, where the water really is the
   * tide being pointed at.
   */
  waterY: number;
  /**
   * Whether the photographic day scene is on: a day plate exists, the theme is
   * day, and this is not the IRL photo. Everything it switches is additive, so
   * false is exactly the scene that shipped before the plate.
   */
  dayPhoto?: boolean;
  /**
   * Drop the per-frame-expensive flourishes.
   *
   * Set while the time-lapse is playing. Every SVG filter in this scene is
   * re-evaluated on each frame the waterline moves — and in the photographic
   * day scene it moves on every frame of a time-lapse — so caustics and
   * refraction, which are close-inspection details, are what a playing
   * time-lapse trades for its frame rate. Nobody reads ripple filaments at
   * four days a second; everybody sees a stutter.
   */
  simplify?: boolean;
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

/**
 * How deep the caustics reach, as a fraction of the plot.
 *
 * Constant on purpose. Tie it to the actual water column and it would change
 * every frame, which would rebuild the mask and defeat the whole point of
 * moving the water with an ancestor transform. Anything below it is clipped.
 */
const CAUSTIC_BAND_FRAC = 0.45;

/**
 * Depth at which the water veil reaches its deepest colour, in metres.
 *
 * A depth, not a fraction of what is left on screen: with the surface at 1 m
 * the water column below it is a few centimetres, and it should read as
 * shallow turquoise, not as a compressed copy of the full ocean gradient.
 */
const VEIL_DEPTH_M = 9;

export function SceneDefs({ geom, horizonY, waterY }: Props) {
  const { PAD_L, PAD_T, plotWidth, plotHeight } = geom;
  const causticH = plotHeight * CAUSTIC_BAND_FRAC;
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

      {/* --- photographic day scene ------------------------------------ */}

      {/* The water in front of the immersed structure. Anchored on the surface
          rather than on datum, because in this scene the surface moves: the
          whole point is that dragging the red line floods the legs. Turquoise
          where the light still reaches, deep navy where it does not. */}
      <linearGradient id="daySeaVeil" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" style={{ stopColor: "var(--day-veil-shallow)" }} />
        <stop offset="34%" style={{ stopColor: "var(--day-veil-mid)" }} />
        <stop offset="100%" style={{ stopColor: "var(--day-veil-deep)" }} />
      </linearGradient>

      {/* Depth fade for the caustics, in the surface's own frame so it never
          has to be rebuilt when the tide moves. */}
      <mask
        id="dayCausticFade"
        maskUnits="userSpaceOnUse"
        x={PAD_L}
        y={0}
        width={plotWidth}
        height={causticH}
      >
        <rect x={PAD_L} y={0} width={plotWidth} height={causticH} fill="url(#dayCausticFadeGrad)" />
      </mask>

      {/* Caustics fade out with depth — they are surface light, so they have no
          business halfway down. A mask rather than an opacity so the falloff is
          smooth instead of a visible edge. */}
      <linearGradient id="dayCausticFadeGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
        <stop offset="9%" stopColor="#fff" stopOpacity="1" />
        <stop offset="46%" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>

      {/* Light gathering where the water meets the legs. This is the cue that
          reads as "the surface is a plane touching the structure" rather than
          "the picture changes colour at this line". */}
      <linearGradient id="daySurfaceGlow" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="var(--day-surface-glow)" stopOpacity="0" />
        <stop offset="55%" stopColor="var(--day-surface-glow)" stopOpacity="0.85" />
        <stop offset="100%" stopColor="var(--day-surface-glow)" stopOpacity="0" />
      </linearGradient>

      {/* Ripple filaments. feTurbulence is expensive but has no dynamic input,
          so the result caches; the surface is moved by translating an ancestor
          <g>, which never dirties the filter. Don't put waterY in here. */}
      <filter
        id="dayCaustics"
        x="-2%"
        y="-2%"
        width="104%"
        height="104%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence type="turbulence" baseFrequency="0.038 0.094" numOctaves="2" seed="17" />
        {/* Keep the red channel as alpha, then a steep curve so only the crests
            survive as filaments instead of the whole cloud. */}
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0 1
                  1 0 0 0 0"
        />
        <feComponentTransfer result="filaments">
          <feFuncA type="table" tableValues="0 0 0 0.05 0.3 1" />
        </feComponentTransfer>
        <feFlood floodColor="#c8f2ec" result="tint" />
        {/* in2 is the filaments, NOT SourceGraphic: compositing against the
            source rect would just mask the flood with a solid rectangle and
            paint the whole band flat. */}
        <feComposite in="tint" in2="filaments" operator="in" />
        <feGaussianBlur stdDeviation="0.8" />
      </filter>

      {/* The submerged structure, refracted. Same grade as daySubmerged with a
          displacement in front of it — water bends what you see through it, and
          without that the legs read as a tinted cut-out rather than as objects
          under a surface. Static turbulence again, for the same reason. */}
      {/* Deliberately a LIGHT touch — much lighter than the night grade.
          Measured against the reference composite, a leg just under the surface
          there is still (206,158,47): almost the dry yellow. It only loses its
          colour further down. So the depth fade belongs to the veil, whose
          alpha climbs with depth, and this filter's whole job is the refraction
          plus enough of a cool cast to say "other side of a surface".
          Grading hard here instead produced a grey ghost at every depth, which
          is the one thing the reference is not. */}
      <filter id="daySubmergedRefract" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.006 0.019"
          numOctaves="2"
          seed="5"
          result="warp"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="warp"
          scale="7"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feColorMatrix type="saturate" values="0.84" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.86" intercept="0.0" />
          <feFuncG type="linear" slope="0.93" intercept="0.01" />
          <feFuncB type="linear" slope="0.9" intercept="0.05" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="0.5" />
      </filter>

      {/* The same grade as daySubmergedRefract with the refraction taken out,
          for while a time-lapse plays. It has to be the same grade: swapping in
          a different one made the immersed legs change colour the instant you
          pressed play. No blur either — a Gaussian over an image this size is
          not free, and there is nothing to soften once the displacement is
          gone. */}
      <filter id="daySubmergedFlat" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0.84" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.86" intercept="0.0" />
          <feFuncG type="linear" slope="0.93" intercept="0.01" />
          <feFuncB type="linear" slope="0.9" intercept="0.05" />
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

/**
 * A photographed sky and sea, used instead of the drawn ones when a plate
 * exists — src/assets/night-sea.* at night, src/assets/day-sea.* by day.
 *
 * The photo is scaled to cover the plot in both directions *and* to land its
 * own horizon on the scene's. That second condition is the whole trick: the
 * picture is not a backdrop behind the structure, it is the world the
 * structure stands in, and it only reads that way if its sky/sea boundary is
 * where the scene says the sea is.
 *
 * At night that is a fixed 4 m — roughly the eye level of someone on a CTV
 * deck. By day it is the red height line, so the horizon sweeps the full
 * 0..10 m as the line is dragged.
 *
 * `scaleFor` is the reason the day plate is asked to have its horizon at
 * mid-height: the scale has to satisfy the sky need AND the water need at
 * every line position, and a centred horizon is where neither dominates.
 */
function SeaPhoto({
  geom,
  horizonY,
  src,
  ratio,
  horizonFrac,
  fixedScale,
}: Props & { src: string; ratio: number; horizonFrac: number; fixedScale?: number }) {
  const { PAD_L, PAD_T, plotWidth, plotHeight } = geom;
  const bottom = PAD_T + plotHeight;
  // Clamped so a mis-measured constant can never divide by zero below.
  const f = Math.min(0.95, Math.max(0.05, horizonFrac));

  // Big enough to cover the width, to reach the top of the plot with the sky
  // above the horizon, and to reach the bottom with the sea below it.
  const h =
    fixedScale ??
    Math.max(plotWidth / ratio, (horizonY - PAD_T) / f, (bottom - horizonY) / (1 - f));
  const w = h * ratio;

  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      <image
        href={src}
        x={PAD_L + plotWidth / 2 - w / 2}
        y={horizonY - f * h}
        width={w}
        height={h}
        // w/h is the photo's own ratio, so nothing is stretched.
        preserveAspectRatio="none"
      />
    </g>
  );
}

/**
 * The size the day plate is drawn at — computed once for the whole 0..10 m
 * travel rather than per frame.
 *
 * Sizing it to the current line position would make the picture breathe in and
 * out as the tide is dragged, which is instantly visible and completely wrong:
 * the sea does not zoom when the tide comes in. Holding the scale fixed and
 * only moving the plate means the horizon slides behind the structure exactly
 * as a real horizon would.
 */
function dayPlateHeight(geom: PlotGeom, ratio: number, yOfHeight: (h: number) => number): number {
  const { PAD_T, plotWidth, plotHeight } = geom;
  const bottom = PAD_T + plotHeight;
  const f = Math.min(0.95, Math.max(0.05, DAY_SEA_HORIZON_FRAC));
  // The extremes of the red line's travel: most sky is needed at its lowest,
  // most water at its highest.
  const lowest = yOfHeight(0);
  const highest = yOfHeight(10);
  return Math.max(plotWidth / ratio, (lowest - PAD_T) / f, (bottom - highest) / (1 - f));
}

/** Sky, stars and the sea body — drawn behind the structure. */
export function SkyLayer({ geom, horizonY, waterY, theme, dayPhoto }: Props & { theme?: Theme }) {
  const { PAD_L, PAD_T, plotWidth, plotHeight, yOfH } = geom;
  const night = theme === "night";
  const plate = dayPhoto ? DAY_SEA_IMG : night ? NIGHT_SEA_IMG : null;
  const photoRatio = useImageRatio(plate);
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

  // A night photo, once it has decoded, stands in for the whole drawn sky and
  // sea. Everything else in the scene — the veil over the immersed legs, the
  // surface line, the tide band — still applies on top of it.
  if (plate && photoRatio !== null) {
    return (
      <SeaPhoto
        geom={geom}
        horizonY={horizonY}
        waterY={waterY}
        src={plate}
        ratio={photoRatio}
        horizonFrac={dayPhoto ? DAY_SEA_HORIZON_FRAC : NIGHT_SEA_HORIZON_FRAC}
        // Fixed for the whole of the line's travel by day, so the picture
        // slides instead of breathing. The night horizon never moves, so its
        // natural cover scale is already constant.
        fixedScale={dayPhoto ? dayPlateHeight(geom, photoRatio, yOfH) : undefined}
      />
    );
  }

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
 * The wavy surface, as a path built once at y = 0 and translated into place.
 *
 * Two frequencies beating against each other so the crests do not line up into
 * a visible period. Built in the surface's own frame on purpose: the tide moves
 * the water sixty times a second during a time-lapse, and rebuilding a path
 * string that often is exactly the kind of per-frame work that turns a scene
 * into a slideshow.
 */
function surfaceWavePath(x0: number, x1: number, amp: number): string {
  const n = 96;
  const span = x1 - x0;
  let d = `M ${x0.toFixed(1)} 0`;
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const y = amp * (Math.sin(u * 31.7) * 0.6 + Math.sin(u * 12.1 + 1.9) * 0.4);
    d += ` L ${(x0 + span * u).toFixed(1)} ${y.toFixed(2)}`;
  }
  return d;
}

/**
 * The water in FRONT of the immersed structure, plus the surface itself.
 * Drawn after the schema so the legs are seen through the sea, not beside it.
 *
 * Two scenes share this. The drawn one is a flat veil over a fixed datum. The
 * photographic day one is the sea itself, at whatever height the red line says,
 * and it has to do rather more work: a graded column that darkens with real
 * depth, caustics under the surface, and a surface that is a band of moving
 * light rather than a ruled line.
 *
 * Everything in the day branch that costs anything is built in the surface's
 * own coordinate frame and moved by a single ancestor transform. Filters and
 * masks therefore never see the tide change, so their results stay cached and
 * the whole scene is one composited translate per frame.
 */
export function WaterVeil({ geom, waterY, dayPhoto, simplify }: Omit<Props, "horizonY">) {
  const { PAD_L, PAD_T, plotWidth, plotHeight, yOfH } = geom;
  const bottom = PAD_T + plotHeight;
  const seaH = Math.max(0, bottom - waterY);

  // Wave amplitude scales with the plot so it is the same apparent chop on a
  // phone as on a desktop, and is clamped so it never becomes a feature.
  const amp = Math.min(5, Math.max(1.6, plotHeight * 0.004));
  const wave = useMemo(
    () => surfaceWavePath(PAD_L, PAD_L + plotWidth, amp),
    [PAD_L, plotWidth, amp],
  );

  if (!dayPhoto) {
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

  // Screen height of VEIL_DEPTH_M of water, measured on the height axis so it
  // is a real depth in both views rather than a fraction of the viewport.
  const veilSpan = Math.max(1, yOfH(0) - yOfH(VEIL_DEPTH_M));
  const causticH = plotHeight * CAUSTIC_BAND_FRAC;
  const glowH = Math.max(6, plotHeight * 0.012);

  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      {/* Promoted to its own layer: the whole water body moves on every frame
          of a time-lapse, and without this the browser repaints the scene
          under it each time. Measured worth about 4 fps at four days a
          second. */}
      <g transform={`translate(0, ${waterY.toFixed(2)})`} style={{ willChange: "transform" }}>
        {/* Below the graded column it is simply deep: one flat rect, tall
            enough to reach the bottom of the plot from the highest the line
            can go, and clipped by the plot either way. */}
        <rect
          x={PAD_L}
          y={veilSpan}
          width={plotWidth}
          height={plotHeight + veilSpan}
          fill="var(--day-veil-deep)"
        />
        <rect x={PAD_L} y={0} width={plotWidth} height={veilSpan} fill="url(#daySeaVeil)" />

        {/* Caustics over the immersed structure, not just over the water: they
            are what stops the legs reading as a tinted cut-out.

            Generated at HALF resolution and scaled back up. feTurbulence costs
            in proportion to the filter region, and at full size this one rect
            was measured at ~27 ms a frame — on its own the single most
            expensive thing in the scene. A quarter of the pixels is a quarter
            of the cost, and on soft rippling light the difference is not
            visible; the filter's baseFrequency is doubled to keep the
            filaments the same size on screen. */}
        {!simplify && (
          <g mask="url(#dayCausticFade)" opacity={0.72}>
            <g transform="scale(2)">
              <rect
                x={PAD_L / 2}
                y={0}
                width={plotWidth / 2}
                height={causticH / 2}
                fill="#c8f2ec"
                filter="url(#dayCaustics)"
              />
            </g>
          </g>
        )}

        {/* Light gathering along the contact line, above and below it. */}
        <rect
          x={PAD_L}
          y={-glowH / 2}
          width={plotWidth}
          height={glowH}
          fill="url(#daySurfaceGlow)"
        />

        {/* The surface itself: a soft shadow just under a bright meniscus, both
            following the same chop so they read as one plane. */}
        <path
          d={wave}
          transform={`translate(0, ${(amp + 1.6).toFixed(2)})`}
          fill="none"
          stroke="var(--day-surface-shadow)"
          strokeWidth={2.6}
          opacity={0.55}
        />
        <path
          d={wave}
          fill="none"
          stroke="var(--day-surface-line)"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
