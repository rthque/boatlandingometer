import type { PlotGeom } from "@/lib/geom";
import type { Theme } from "@/hooks/use-theme";

type Props = {
  geom: PlotGeom;
  img: string;
  imageLeft: number;
  imageTop: number;
  imageDisplayWidth: number;
  imageDisplayHeight: number;
  sunriseH: number | null;
  sunsetH: number | null;
  /** Screen y of chart datum. Everything below it is underwater. */
  waterY: number;
  /**
   * Whether the sky/sea scene is behind this view. False for the IRL photo,
   * which brings its own sky and sea and only gets a colour grade.
   */
  scene: boolean;
  theme: Theme;
  /** Photographic day scene — the submerged half is refracted, not just tinted. */
  dayPhoto?: boolean;
  /** Time-lapse playing: drop the refraction, which is the costly half. */
  simplify?: boolean;
};

// The structure itself, graded for the time of day and split at the waterline
// so the immersed part reads as being in the sea rather than in front of it.
export function BackgroundLayer({
  geom,
  img,
  imageLeft,
  imageTop,
  imageDisplayWidth,
  imageDisplayHeight,
  sunriseH,
  sunsetH,
  waterY,
  scene,
  theme,
  dayPhoto,
  simplify,
}: Props) {
  const { PAD_L, PAD_T, plotWidth, plotHeight, xOfT, yOfH } = geom;
  const night = theme === "night";

  const aboveGrade = night ? "url(#nightGrade)" : scene ? "url(#dayGrade)" : undefined;
  /**
   * In the photographic day scene the dry pass is graded by CSS, not by the
   * SVG filter.
   *
   * dayGrade is nearly a no-op — a touch of desaturation — and it was measured
   * costing ~11 ms a frame as an SVG filter, because every frame the waterline
   * moves repaints this layer and re-runs it. The CSS equivalent is composited
   * and measured ~4 ms cheaper. Night and IRL keep the SVG filter untouched:
   * they are required to stay pixel-identical, and this scene is new anyway.
   */
  const cssGrade = dayPhoto ? "saturate(0.92) brightness(0.98)" : undefined;
  // Water bends what you see through it. Without the displacement the immersed
  // legs are a tinted cut-out of the dry ones, which is the single biggest tell
  // that the water is a coloured rectangle rather than a volume.
  const belowGrade = night
    ? "url(#submergedGrade)"
    : dayPhoto
      ? simplify
        ? "url(#daySubmergedFlat)"
        : "url(#daySubmergedRefract)"
      : "url(#daySubmerged)";

  const common = {
    href: img,
    x: imageLeft,
    y: imageTop,
    width: imageDisplayWidth,
    height: imageDisplayHeight,
    preserveAspectRatio: "none" as const,
  };

  const surfaceY = Math.max(PAD_T, Math.min(PAD_T + plotHeight, waterY));

  return (
    <g clipPath="url(#plotClip)">
      <defs>
        {!dayPhoto && (
          <clipPath id="aboveWater">
            <rect x={PAD_L} y={PAD_T} width={plotWidth} height={Math.max(0, surfaceY - PAD_T)} />
          </clipPath>
        )}
        <clipPath id="belowWater">
          <rect
            x={PAD_L}
            y={surfaceY}
            width={plotWidth}
            height={Math.max(0, PAD_T + plotHeight - surfaceY)}
          />
        </clipPath>
      </defs>

      {scene ? (
        <>
          {/* In the photographic day scene the dry structure is drawn WHOLE and
              the immersed treatment laid over it, so only the overlay has to
              follow the water. Clipping it into two halves instead means both
              filtered images are re-rasterised on every frame the waterline
              moves — and there it moves on every frame of a time-lapse.

              Everywhere else it stays clipped into two halves, exactly as
              before. The two are NOT pixel-identical: drawn whole, the dry
              pass shows through wherever the overlay is less than fully
              opaque, which along the artwork's antialiased edges is a few
              hundred pixels. Night and IRL are required to be unchanged, so
              they keep the old path.

              "The old path" means this markup and not merely this effect: the
              clip goes on the <image>, never on a wrapping <g>. The two are
              equivalent on paper — filter first, then clip, either way — but
              equivalent on paper is not what night and IRL are held to, and
              wrapping them measured a handful of pixels off the baseline on
              one run in five. Identical markup cannot.

              The keys are load-bearing for the same reason. Without them React
              reconciles one <image> across the theme toggle, and clearing the
              day branch's inline filter leaves an empty style="" behind on the
              night element — inert, but a difference from the baseline that
              only appears when you arrive at night BY TOGGLING. Distinct keys
              remount instead, so night's markup is the same however you got
              there. */}
          {dayPhoto ? (
            <image key="dry-photo" {...common} style={{ filter: cssGrade }} />
          ) : (
            <image key="dry-clipped" {...common} clipPath="url(#aboveWater)" filter={aboveGrade} />
          )}
          <image {...common} clipPath="url(#belowWater)" filter={belowGrade} />
        </>
      ) : (
        // The photo already contains its own horizon; splitting it at chart
        // datum would cut through the picture, not through water.
        <image {...common} opacity={0.95} filter={aboveGrade} />
      )}

      {/* Night bands: the hours before sunrise and after sunset are dimmed, so
         the timeline shows at a glance when there is daylight to work in. */}
      {sunriseH !== null && sunriseH > 0 && (
        <rect
          x={PAD_L}
          y={yOfH(10)}
          width={Math.max(0, xOfT(sunriseH) - PAD_L)}
          height={Math.max(0, yOfH(0) - yOfH(10))}
          fill="var(--night-band)"
          pointerEvents="none"
        />
      )}
      {sunsetH !== null && sunsetH < 24 && (
        <rect
          x={xOfT(sunsetH)}
          y={yOfH(10)}
          width={Math.max(0, PAD_L + plotWidth - xOfT(sunsetH))}
          height={Math.max(0, yOfH(0) - yOfH(10))}
          fill="var(--night-band)"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
