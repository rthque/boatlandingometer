import type { PlotGeom } from "@/lib/geom";
import { fmtTime } from "@/lib/tide-math";

type Props = {
  geom: PlotGeom;
  hover: { x: number; t: number; h: number };
};

// Mouse-hover crosshair (vertical + horizontal dashed lines and a dot) with a
// tooltip showing the time and water height at the pointer.
export function HoverTooltip({ geom, hover }: Props) {
  const { PAD_L, PAD_T, plotWidth, plotHeight, yOfH } = geom;
  const tipW = 130;
  const tipH = 44;
  const left = hover.x + 12 + tipW > PAD_L + plotWidth ? hover.x - 12 - tipW : hover.x + 12;
  const top = Math.max(PAD_T + 4, yOfH(hover.h) - tipH - 10);
  return (
    <g>
      <line
        x1={hover.x}
        x2={hover.x}
        y1={PAD_T}
        y2={PAD_T + plotHeight}
        stroke="oklch(0.3 0.05 250)"
        strokeDasharray="3 3"
      />
      <line
        x1={PAD_L}
        x2={PAD_L + plotWidth}
        y1={yOfH(hover.h)}
        y2={yOfH(hover.h)}
        stroke="oklch(0.3 0.05 250)"
        strokeDasharray="3 3"
      />
      <circle
        cx={hover.x}
        cy={yOfH(hover.h)}
        r={5}
        fill="oklch(0.5 0.22 25)"
        stroke="white"
        strokeWidth={2}
      />
      <rect x={left} y={top} width={tipW} height={tipH} rx={6} fill="oklch(0.18 0.02 250 / 0.92)" />
      <text x={left + 10} y={top + 18} fontSize="12" fill="white">
        {fmtTime(hover.t)}
      </text>
      <text x={left + 10} y={top + 35} fontSize="13" fontWeight={600} fill="white">
        {hover.h.toFixed(2)} m
      </text>
    </g>
  );
}
