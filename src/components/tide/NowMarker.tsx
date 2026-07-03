import type { PlotGeom } from "@/lib/geom";
import { fmtTime } from "@/lib/tide-math";

type Props = {
  geom: PlotGeom;
  markerT: number;
  markerH: number;
};

// The vertical "now" marker — the real current time, or the time-lapse clock
// while the animation runs — with the water height and time chips.
export function NowMarker({ geom, markerT, markerH }: Props) {
  const { PAD_T, plotHeight, totalHeight, xOfT, yOfH } = geom;
  const x = xOfT(markerT);
  const y = yOfH(markerH);
  return (
    <g pointerEvents="none">
      <line
        x1={x}
        x2={x}
        y1={y}
        y2={PAD_T + plotHeight}
        stroke="oklch(0.55 0.22 25)"
        strokeWidth={1.5}
        strokeDasharray="6 3"
      />
      <circle cx={x} cy={y} r={7} fill="oklch(0.55 0.22 25)" stroke="white" strokeWidth={2.5} />
      <rect x={x - 28} y={y - 28} width={56} height={18} rx={4} fill="oklch(0.55 0.22 25)" />
      <text x={x} y={y - 16} textAnchor="middle" fontSize="11" fontWeight={700} fill="white">
        {markerH.toFixed(2)}m
      </text>
      <rect
        x={x - 24}
        y={totalHeight - 38}
        width={48}
        height={16}
        rx={3}
        fill="oklch(0.55 0.22 25)"
      />
      <text
        x={x}
        y={totalHeight - 27}
        textAnchor="middle"
        fontSize="10"
        fontWeight={700}
        fill="white"
      >
        {fmtTime(markerT)}
      </text>
    </g>
  );
}
