import type { PlotGeom } from "@/lib/geom";
import { fmtTime, fmtDuration } from "@/lib/tide-math";

type Props = {
  geom: PlotGeom;
  targetHeight: number;
  setTargetHeight: (h: number) => void;
  draggingLine: boolean;
  setDraggingLine: (v: boolean) => void;
  crossings: number[];
  tideHeight: (t: number) => number;
  sunriseH: number | null;
  sunsetH: number | null;
};

// The draggable reference-height line: a full-width horizontal line the user can
// drag up/down, annotated with the times the tide crosses it (yellow chips) and,
// for each daytime stretch below it, how long the tide stays low (red chips).
export function HeightLine({
  geom,
  targetHeight,
  setTargetHeight,
  draggingLine,
  setDraggingLine,
  crossings,
  tideHeight,
  sunriseH,
  sunsetH,
}: Props) {
  const { PAD_L, PAD_T, plotWidth, plotHeight, Y_MIN, Y_MAX, xOfT, yOfH, pointerToPlot } = geom;
  const yLine = yOfH(targetHeight);
  const labelW = 52;
  const labelH = 18;

  return (
    <g>
      {/* Wide invisible hit area for touch/mouse dragging. Tall band (±30px)
         spanning from the very left edge (so the grip square is grabbable too)
         across the whole plot. */}
      <rect
        x={0}
        y={yLine - 30}
        width={PAD_L + plotWidth}
        height={60}
        fill="transparent"
        style={{ cursor: "ns-resize", touchAction: "none" }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
          setDraggingLine(true);
        }}
        onPointerMove={(e) => {
          if (!draggingLine) return;
          e.preventDefault();
          e.stopPropagation();
          const { y } = pointerToPlot(e);
          const h = Y_MAX - ((y - PAD_T) / plotHeight) * (Y_MAX - Y_MIN);
          setTargetHeight(Math.max(0, Math.min(10, h)));
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
          setDraggingLine(false);
        }}
        onPointerCancel={(e) => {
          e.stopPropagation();
          setDraggingLine(false);
        }}
      />
      {/* Visible line */}
      <line
        x1={PAD_L}
        x2={PAD_L + plotWidth}
        y1={yLine}
        y2={yLine}
        stroke="oklch(0.45 0.04 250)"
        strokeWidth={draggingLine ? 2 : 1.4}
        pointerEvents="none"
      />
      {/* Grip handle on the left — bigger, easier to target */}
      <g pointerEvents="none">
        <rect
          x={PAD_L - 6}
          y={yLine - 22}
          width={40}
          height={44}
          rx={10}
          fill="oklch(0.6 0.22 25)"
          stroke="white"
          strokeWidth={draggingLine ? 2.5 : 1.5}
        />
        {[-7, 0, 7].map((dy) => (
          <line
            key={dy}
            x1={PAD_L + 4}
            x2={PAD_L + 24}
            y1={yLine + dy}
            y2={yLine + dy}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Crossing time labels (yellow chips) — always above the line so they
         don't collide with the low-tide duration chip below. */}
      {crossings.map((tc, i) => {
        const cx = xOfT(tc);
        const cy = yLine - labelH / 2 - 4;
        return (
          <g key={i} pointerEvents="none">
            <rect
              x={cx - labelW / 2}
              y={cy - labelH / 2}
              width={labelW}
              height={labelH}
              rx={3}
              fill="oklch(0.96 0.1 95)"
              stroke="oklch(0.55 0.05 90)"
              strokeWidth={0.75}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight={600}
              fill="oklch(0.25 0.04 60)"
            >
              {fmtTime(tc)}
            </text>
          </g>
        );
      })}

      {/* Low-tide interval labels (duration under target height). Clipped to the
         daytime window [sunrise, sunset] so only the low-tide time during
         daylight is shown. */}
      {(() => {
        const dayLo = sunriseH ?? 0;
        const dayHi = sunsetH ?? 24;
        const segs: { t1: number; t2: number }[] = [];
        const bounds = [0, ...crossings, 24];
        for (let i = 0; i < bounds.length - 1; i++) {
          const a = bounds[i];
          const b = bounds[i + 1];
          const mid = (a + b) / 2;
          if (tideHeight(mid) < targetHeight) {
            const t1 = Math.max(a, dayLo);
            const t2 = Math.min(b, dayHi);
            if (t2 > t1) segs.push({ t1, t2 });
          }
        }
        return segs.map((s, i) => {
          const x1 = xOfT(s.t1);
          const x2 = xOfT(s.t2);
          const cx = (x1 + x2) / 2;
          const dur = fmtDuration(s.t2 - s.t1);
          const chipW = Math.min(82, Math.max(56, dur.length * 8 + 16));
          const chipH = 16;
          return (
            <g key={`seg${i}`} pointerEvents="none">
              <line
                x1={x1 + 2}
                x2={x2 - 2}
                y1={yLine}
                y2={yLine}
                stroke="oklch(0.55 0.18 25)"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <rect
                x={cx - chipW / 2}
                y={yLine + 6}
                width={chipW}
                height={chipH}
                rx={3}
                fill="oklch(0.55 0.18 25)"
              />
              <text
                x={cx}
                y={yLine + 6 + chipH / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight={700}
                fill="white"
              >
                {dur}
              </text>
            </g>
          );
        });
      })()}

      {/* Red height chip on the right */}
      <g pointerEvents="none">
        <rect
          x={PAD_L + plotWidth - 48}
          y={yLine - 9}
          width={48}
          height={18}
          rx={2}
          fill="oklch(0.6 0.22 25)"
        />
        <text
          x={PAD_L + plotWidth - 24}
          y={yLine + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight={700}
          fill="white"
        >
          {targetHeight.toFixed(2).replace(".", ",")}m
        </text>
      </g>
    </g>
  );
}
