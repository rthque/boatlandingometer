import type { PlotGeom } from "@/lib/geom";

type Props = {
  geom: PlotGeom;
  img: string;
  imageLeft: number;
  imageTop: number;
  imageDisplayWidth: number;
  imageDisplayHeight: number;
  sunriseH: number | null;
  sunsetH: number | null;
};

// The schema/photo background plus the night bands (darker overlay before
// sunrise on the left and after sunset on the right). Clipped to the plot area.
export function BackgroundLayer({
  geom,
  img,
  imageLeft,
  imageTop,
  imageDisplayWidth,
  imageDisplayHeight,
  sunriseH,
  sunsetH,
}: Props) {
  const { PAD_L, plotWidth, xOfT, yOfH } = geom;
  return (
    <g clipPath="url(#plotClip)">
      <image
        href={img}
        x={imageLeft}
        y={imageTop}
        width={imageDisplayWidth}
        height={imageDisplayHeight}
        preserveAspectRatio="none"
        opacity={0.95}
      />
      {/* Night bands: darker overlay before sunrise (left = morning) and
         after sunset (right = evening); the lit middle is daytime. */}
      {sunriseH !== null && sunriseH > 0 && (
        <rect
          x={PAD_L}
          y={yOfH(10)}
          width={Math.max(0, xOfT(sunriseH) - PAD_L)}
          height={Math.max(0, yOfH(0) - yOfH(10))}
          fill="oklch(0.18 0.04 265 / 0.14)"
          pointerEvents="none"
        />
      )}
      {sunsetH !== null && sunsetH < 24 && (
        <rect
          x={xOfT(sunsetH)}
          y={yOfH(10)}
          width={Math.max(0, PAD_L + plotWidth - xOfT(sunsetH))}
          height={Math.max(0, yOfH(0) - yOfH(10))}
          fill="oklch(0.18 0.04 265 / 0.14)"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
