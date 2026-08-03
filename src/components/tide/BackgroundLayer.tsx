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
}: Props) {
  const { PAD_L, PAD_T, plotWidth, plotHeight, xOfT, yOfH } = geom;
  const night = theme === "night";

  const aboveGrade = night ? "url(#nightGrade)" : scene ? "url(#dayGrade)" : undefined;
  const belowGrade = night ? "url(#submergedGrade)" : "url(#daySubmerged)";

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
        <clipPath id="aboveWater">
          <rect x={PAD_L} y={PAD_T} width={plotWidth} height={Math.max(0, surfaceY - PAD_T)} />
        </clipPath>
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
          <image {...common} clipPath="url(#aboveWater)" filter={aboveGrade} />
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
