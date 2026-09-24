import type { PlotGeom } from "@/lib/geom";
import type { ExtremePoint } from "@/lib/tide-math";

type Props = {
  geom: PlotGeom;
  seaPath: string;
  curvePath: string;
  visibleExtremes: ExtremePoint[];
  /**
   * Photographic day scene. There the band is drawn over real water, so it is
   * pulled right back: two translucent blues stacked on each other turned the
   * whole lower half milky and swallowed the immersed legs. The curve, the
   * dots and the extremes carry the reading; the band only has to hint at the
   * shape, and it must never compete with the water it floats on.
   */
  dayPhoto?: boolean;
};

// The sea fill under the tide curve, the curve itself, and a dot on each
// high/low-water extreme.
export function TideCurve({ geom, seaPath, curvePath, visibleExtremes, dayPhoto }: Props) {
  const { xOfT, yOfH } = geom;
  return (
    <>
      <path
        d={seaPath}
        fill="url(#seaGrad)"
        opacity={dayPhoto ? 0.18 : undefined}
        clipPath="url(#plotClip)"
      />
      {/* Under water the line loses contrast against a mid-blue veil, so in the
          photographic scene it gets a pale casing first — the same trick the
          axis labels use against the structure. Readability of the measured
          thing wins over purity of the picture. */}
      {dayPhoto && (
        <path
          d={curvePath}
          fill="none"
          stroke="oklch(0.99 0.01 220 / 0.55)"
          strokeWidth={4.5}
          strokeLinecap="round"
          clipPath="url(#plotClip)"
        />
      )}
      <path
        d={curvePath}
        fill="none"
        stroke="oklch(0.45 0.2 250)"
        strokeWidth={2}
        clipPath="url(#plotClip)"
      />
      {visibleExtremes.map((e, i) => (
        <circle
          key={i}
          cx={xOfT(e.t)}
          cy={yOfH(e.h)}
          r={4}
          fill={e.high ? "oklch(0.55 0.22 25)" : "oklch(0.55 0.18 145)"}
          stroke="white"
          strokeWidth={1.5}
        />
      ))}
    </>
  );
}
