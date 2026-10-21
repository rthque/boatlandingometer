import type { PlotGeom } from "@/lib/geom";
import { fmtTime } from "@/lib/tide-math";

type Props = {
  geom: PlotGeom;
  markerT: number;
  markerH: number;
  /** Estimated highest water with the forecast waves, when the band is on. */
  crestH?: number | null;
};

// The vertical "now" marker — the real current time, or the time-lapse clock
// while the animation runs — with the water height and time chips.
export function NowMarker({ geom, markerT, markerH, crestH = null }: Props) {
  const { PAD_T, plotHeight, totalHeight, xOfT, yOfH } = geom;
  const x = xOfT(markerT);
  const y = yOfH(markerH);
  // The crest chip sits over the crest point, but never lower than one chip
  // above the tide chip: with a small sea the two points are a few pixels apart
  // and the chips would stack on top of each other.
  const yCrest = crestH === null ? null : yOfH(crestH);
  const crestChipY = yCrest === null ? 0 : Math.min(yCrest - 28, y - 28 - 21);
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
      {yCrest !== null && crestH !== null && (
        <g>
          <title>{`Highest water estimated with the forecast waves: ${crestH.toFixed(2)} m`}</title>
          <line x1={x} x2={x} y1={yCrest} y2={y} stroke="var(--wave-crest)" strokeWidth={2} />
          <circle
            cx={x}
            cy={yCrest}
            r={4.5}
            fill="var(--wave-crest)"
            stroke="white"
            strokeWidth={2}
          />
          <rect x={x - 30} y={crestChipY} width={60} height={18} rx={4} fill="var(--wave-crest)" />
          <text
            x={x}
            y={crestChipY + 12}
            textAnchor="middle"
            fontSize="11"
            fontWeight={700}
            fill="var(--wave-crest-ink)"
          >
            ≈{crestH.toFixed(2)}m
          </text>
        </g>
      )}
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
