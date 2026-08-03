import type { PlotGeom } from "@/lib/geom";

type Props = {
  geom: PlotGeom;
  yTicks: number[];
  xTicks: number[];
};

// Metre gridlines/labels and hour ticks/labels, overlaid directly on the schema
// rather than in margin bands. Labels carry a halo in the opposite value to the
// ink so they stay legible over sky, structure or sea — both tokens flip with
// the theme (see --axis-ink / --axis-halo in styles.css).
export function AxisGrid({ geom, yTicks, xTicks }: Props) {
  const { PAD_L, plotWidth, width, totalHeight, xOfT, yOfH } = geom;
  const labelStyle = {
    fill: "var(--axis-ink)",
    stroke: "var(--axis-halo)",
  } as const;
  return (
    <>
      {/* Y gridlines + labels (meters) */}
      {yTicks.map((m) => (
        <g key={`y${m}`}>
          <line
            x1={PAD_L}
            x2={PAD_L + plotWidth}
            y1={yOfH(m)}
            y2={yOfH(m)}
            style={{ stroke: "var(--axis-ink)" }}
            strokeOpacity={0.35}
            strokeDasharray="2 3"
          />
          <text
            x={4}
            y={yOfH(m) - 3}
            textAnchor="start"
            fontSize="18"
            fontWeight={800}
            style={labelStyle}
            strokeWidth={4}
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {m}m
          </text>
        </g>
      ))}

      {/* X ticks + labels (hours) */}
      {xTicks.map((h) => {
        const isFirst = h === 0;
        const isLast = h === 24;
        // On narrow (phone) screens, label every 4h so the bigger numbers
        // don't overlap.
        const labelStep = width < 480 ? 4 : 2;
        const showLabel = h % labelStep === 0;
        return (
          <g key={`x${h}`}>
            {showLabel && (
              <text
                x={isFirst ? 4 : isLast ? width - 4 : xOfT(h)}
                y={totalHeight - 6}
                textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                fontSize="18"
                fontWeight={800}
                style={labelStyle}
                strokeWidth={4}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {h}h
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
