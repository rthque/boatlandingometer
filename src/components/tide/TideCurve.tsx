import type { PlotGeom } from "@/lib/geom";
import type { ExtremePoint } from "@/lib/tide-math";

type Props = {
  geom: PlotGeom;
  seaPath: string;
  curvePath: string;
  visibleExtremes: ExtremePoint[];
};

// The sea fill under the tide curve, the curve itself, and a dot on each
// high/low-water extreme.
export function TideCurve({ geom, seaPath, curvePath, visibleExtremes }: Props) {
  const { xOfT, yOfH } = geom;
  return (
    <>
      <path d={seaPath} fill="url(#seaGrad)" clipPath="url(#plotClip)" />
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
