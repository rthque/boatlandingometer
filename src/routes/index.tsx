import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import chartDatumAsset from "@/assets/chart-datum.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marée Dieppe — Samedi 13 Juin 2026" },
      { name: "description", content: "Horaires des marées à Dieppe superposés à la structure jacket (chart datum)." },
    ],
  }),
  component: Index,
});

// Tide extremes for Dieppe — Samedi 13 Juin 2026 (from maree.info/14)
const EXTREMES = [
  { t: 5 + 4 / 60, h: 1.73, type: "BM", coeff: null as number | null },
  { t: 10 + 45 / 60, h: 8.52, type: "PM", coeff: 74 },
  { t: 17 + 33 / 60, h: 1.61, type: "BM", coeff: null },
  { t: 23 + 12 / 60, h: 8.85, type: "PM", coeff: 79 },
];

// Boundary heights at t=0 and t=24 (approx, smooths the curve)
const BOUNDARY_START = 6.9;
const BOUNDARY_END = 8.6;

// Cosine interpolation between successive tide extremes
function tideHeight(t: number): number {
  const pts = [
    { t: 0, h: BOUNDARY_START },
    ...EXTREMES,
    { t: 24, h: BOUNDARY_END },
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / (b.t - a.t);
      const eased = (1 - Math.cos(u * Math.PI)) / 2;
      return a.h + (b.h - a.h) * eased;
    }
  }
  return pts[pts.length - 1].h;
}

// Calibration from the chart-datum image (1789x1920).
// Maps tide height (m) -> vertical fraction of the image (0 = top, 1 = bottom)
const CALIB: { h: number; frac: number }[] = [
  { h: 23, frac: 0.1008 },
  { h: 18, frac: 0.2635 },
  { h: 14.4, frac: 0.3867 },
  { h: 11, frac: 0.5003 },
  { h: 8, frac: 0.6047 },
  { h: 7, frac: 0.6714 },
  { h: 3.5, frac: 0.7589 },
  { h: 1, frac: 0.8411 },
  { h: 0, frac: 0.876 },
];

function heightToFrac(h: number): number {
  // Extrapolate above the top calibration point using the slope of the top segment
  if (h >= CALIB[0].h) {
    const a = CALIB[0];
    const b = CALIB[1];
    const slope = (b.frac - a.frac) / (b.h - a.h); // negative
    return a.frac + slope * (h - a.h);
  }
  if (h <= CALIB[CALIB.length - 1].h) return CALIB[CALIB.length - 1].frac;
  for (let i = 0; i < CALIB.length - 1; i++) {
    const a = CALIB[i];
    const b = CALIB[i + 1];
    if (h <= a.h && h >= b.h) {
      const u = (a.h - h) / (a.h - b.h);
      return a.frac + (b.frac - a.frac) * u;
    }
  }
  return CALIB[CALIB.length - 1].frac;
}

function fmtTime(t: number): string {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  const mm = m === 60 ? 0 : m;
  const hh = m === 60 ? h + 1 : h;
  return `${String(hh).padStart(2, "0")}h${String(mm).padStart(2, "0")}`;
}

function Index() {
  // Chart geometry — y-axis spans 0..23m so it matches the image scale.
  const Y_MIN = 0;
  const Y_MAX = 26;
  const IMG_RATIO = 1789 / 1920;

  // The chart's plotted area pixel height is derived from container width.
  // We render the image so its full height equals: plotHeight / (frac(0) - frac(23))
  // That guarantees the image's 0m and 23m lines sit exactly on the chart's 0m and 23m gridlines.
  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 36;

  const [width, setWidth] = useState(900);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Measure container
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setWidth(Math.max(360, Math.floor(e.contentRect.width)));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Tall aspect ratio — optimized for mobile (portrait), capped on desktop
  const plotHeight = Math.min(1100, Math.max(560, Math.round(width * 1.5)));
  const totalHeight = plotHeight + PAD_T + PAD_B;
  const plotWidth = width - PAD_L - PAD_R;

  const xOfT = (t: number) => PAD_L + (t / 24) * plotWidth;
  const yOfH = (h: number) => PAD_T + ((Y_MAX - h) / (Y_MAX - Y_MIN)) * plotHeight;
  const tOfX = (x: number) => ((x - PAD_L) / plotWidth) * 24;

  // Image vertical placement: scale so that frac(23m)..frac(0m) of image span y(23m)..y(0m) of plot
  const fracTop = heightToFrac(Y_MAX);
  const fracBot = heightToFrac(Y_MIN);
  const visibleFrac = fracBot - fracTop;
  const imageDisplayHeight = plotHeight / visibleFrac;
  const imageDisplayWidth = imageDisplayHeight * IMG_RATIO;
  const imageTop = PAD_T - fracTop * imageDisplayHeight;
  const imageLeft = PAD_L + plotWidth / 2 - imageDisplayWidth / 2;

  // Tide curve path
  const curvePath = useMemo(() => {
    const steps = 480;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      const x = xOfT(t);
      const y = yOfH(tideHeight(t));
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, plotHeight]);

  // Sea fill (under the curve)
  const seaPath = useMemo(() => {
    const steps = 240;
    let d = `M ${xOfT(0).toFixed(2)} ${yOfH(Y_MIN).toFixed(2)}`;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      d += ` L ${xOfT(t).toFixed(2)} ${yOfH(tideHeight(t)).toFixed(2)}`;
    }
    d += ` L ${xOfT(24).toFixed(2)} ${yOfH(Y_MIN).toFixed(2)} Z`;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, plotHeight]);

  const [hover, setHover] = useState<{ x: number; t: number; h: number } | null>(null);
  const [targetHeight, setTargetHeight] = useState<number>(4.29);
  const [draggingLine, setDraggingLine] = useState(false);

  const updateFromPointer = (e: React.PointerEvent<SVGElement>) => {
    const svg = (e.currentTarget.ownerSVGElement ?? e.currentTarget) as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * totalHeight;
    return { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const { x, y } = updateFromPointer(e);

    if (draggingLine) {
      const h = Y_MAX - ((y - PAD_T) / plotHeight) * (Y_MAX - Y_MIN);
      setTargetHeight(Math.max(Y_MIN, Math.min(Y_MAX, h)));
      return;
    }

    if (e.pointerType === "touch") return; // no hover on touch
    if (x < PAD_L || x > PAD_L + plotWidth) {
      setHover(null);
      return;
    }
    const t = tOfX(x);
    const h = tideHeight(t);
    setHover({ x: xOfT(t), t, h });
  };

  // Compute times where the tide curve crosses targetHeight
  const crossings = useMemo(() => {
    const steps = 2880; // 30s resolution
    const xs: number[] = [];
    let prev = tideHeight(0) - targetHeight;
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * 24;
      const curr = tideHeight(t) - targetHeight;
      if (prev === 0 || (prev < 0) !== (curr < 0)) {
        const tPrev = ((i - 1) / steps) * 24;
        const u = prev === curr ? 0 : prev / (prev - curr);
        xs.push(tPrev + u * (24 / steps));
      }
      prev = curr;
    }
    return xs;
  }, [targetHeight]);

  const yTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];
  const xTicks = Array.from({ length: 13 }, (_, i) => i * 2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-2 py-3 sm:px-4 sm:py-6">
        {/* Header bar like maree.info */}
        <div className="rounded-t-md border border-border bg-[oklch(0.95_0.08_95)] px-4 py-2 text-sm font-semibold text-foreground">
          <span>Samedi 13 Juin 2026</span>
          <span className="ml-3 font-normal text-muted-foreground">UTC+2 · Semaine 24</span>
          <span className="ml-6 font-normal text-muted-foreground">Lever du soleil: 05h48 · Coucher du soleil: 22h03</span>
        </div>

        {/* Tide extremes table */}
        <div className="border border-t-0 border-border bg-card px-4 py-3">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-1 text-left font-medium"></th>
                <th className="py-1 text-left font-medium">Coeff.</th>
                <th className="py-1 text-left font-medium">Heure</th>
                <th className="py-1 text-left font-medium">Hauteur</th>
              </tr>
            </thead>
            <tbody>
              {EXTREMES.map((e, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="py-1 font-semibold">{e.type}</td>
                  <td className="py-1">{e.coeff ?? ""}</td>
                  <td className="py-1 tabular-nums">{fmtTime(e.t)}</td>
                  <td className="py-1 tabular-nums">{e.h.toFixed(2)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div
          ref={containerRef}
          className="relative border border-t-0 border-border bg-card"
          style={{ overflow: "hidden" }}
        >
          <div className="px-4 pt-3 text-center text-sm font-medium text-muted-foreground">
            Horaires des marées à Dieppe — superposés à la structure (chart datum)
          </div>

          <svg
            width={width}
            height={totalHeight}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => { setHover(null); }}
            onPointerUp={() => setDraggingLine(false)}
            onPointerCancel={() => setDraggingLine(false)}
            style={{ display: "block", cursor: "crosshair", touchAction: draggingLine ? "none" : "auto" }}
            style={{ display: "block", cursor: "crosshair" }}
          >
            {/* Background image — clipped to plot area */}
            <defs>
              <clipPath id="plotClip">
                <rect x={PAD_L} y={PAD_T} width={plotWidth} height={plotHeight} />
              </clipPath>
              <linearGradient id="seaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.13 230)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="oklch(0.45 0.15 240)" stopOpacity="0.65" />
              </linearGradient>
            </defs>

            <g clipPath="url(#plotClip)">
              <image
                href={chartDatumAsset.url}
                x={imageLeft}
                y={imageTop}
                width={imageDisplayWidth}
                height={imageDisplayHeight}
                preserveAspectRatio="none"
                opacity={0.95}
              />
            </g>

            {/* Plot border */}
            <rect
              x={PAD_L}
              y={PAD_T}
              width={plotWidth}
              height={plotHeight}
              fill="none"
              stroke="oklch(0.85 0.01 250)"
            />

            {/* Y gridlines + labels (meters) */}
            {yTicks.map((m) => (
              <g key={`y${m}`}>
                <line
                  x1={PAD_L}
                  x2={PAD_L + plotWidth}
                  y1={yOfH(m)}
                  y2={yOfH(m)}
                  stroke="oklch(0.7 0.02 250 / 0.35)"
                  strokeDasharray="2 3"
                />
                <text
                  x={PAD_L - 8}
                  y={yOfH(m) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="oklch(0.35 0.02 250)"
                >
                  {m}
                </text>
              </g>
            ))}
            <text
              x={14}
              y={PAD_T + plotHeight / 2}
              textAnchor="middle"
              fontSize="12"
              fill="oklch(0.3 0.02 250)"
              transform={`rotate(-90 14 ${PAD_T + plotHeight / 2})`}
            >
              Hauteur (m)
            </text>

            {/* X ticks + labels (hours) */}
            {xTicks.map((h) => (
              <g key={`x${h}`}>
                <line
                  x1={xOfT(h)}
                  x2={xOfT(h)}
                  y1={PAD_T}
                  y2={PAD_T + plotHeight}
                  stroke="oklch(0.7 0.02 250 / 0.25)"
                  strokeDasharray="2 3"
                />
                <text
                  x={xOfT(h)}
                  y={PAD_T + plotHeight + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fill="oklch(0.35 0.02 250)"
                >
                  {h}
                </text>
              </g>
            ))}
            <text
              x={PAD_L + plotWidth / 2}
              y={totalHeight - 6}
              textAnchor="middle"
              fontSize="12"
              fill="oklch(0.3 0.02 250)"
            >
              Heures
            </text>

            {/* Sea fill under curve */}
            <path d={seaPath} fill="url(#seaGrad)" clipPath="url(#plotClip)" />

            {/* Tide curve */}
            <path
              d={curvePath}
              fill="none"
              stroke="oklch(0.45 0.2 250)"
              strokeWidth={2}
              clipPath="url(#plotClip)"
            />

            {/* Extreme markers */}
            {EXTREMES.map((e, i) => (
              <g key={i}>
                <circle
                  cx={xOfT(e.t)}
                  cy={yOfH(e.h)}
                  r={4}
                  fill={e.type === "PM" ? "oklch(0.55 0.22 25)" : "oklch(0.55 0.18 145)"}
                  stroke="white"
                  strokeWidth={1.5}
                />
              </g>
            ))}

            {/* Draggable height line with crossing-time labels */}
            {(() => {
              const yLine = yOfH(targetHeight);
              const labelW = 52;
              const labelH = 18;
              return (
                <g>
                  {/* Hit area for dragging (thicker, invisible) */}
                  <line
                    x1={PAD_L}
                    x2={PAD_L + plotWidth}
                    y1={yLine}
                    y2={yLine}
                    stroke="transparent"
                    strokeWidth={14}
                    style={{ cursor: "ns-resize" }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDraggingLine(true);
                    }}
                  />
                  {/* Visible line */}
                  <line
                    x1={PAD_L}
                    x2={PAD_L + plotWidth}
                    y1={yLine}
                    y2={yLine}
                    stroke="oklch(0.45 0.04 250)"
                    strokeWidth={1.2}
                    pointerEvents="none"
                  />
                  {/* Crossing time labels (yellow chips) */}
                  {crossings.map((tc, i) => {
                    const cx = xOfT(tc);
                    const slope =
                      tideHeight(Math.min(24, tc + 0.05)) - tideHeight(Math.max(0, tc - 0.05));
                    const above = slope > 0; // rising tide -> chip above the line
                    const cy = above ? yLine - labelH / 2 - 2 : yLine + labelH / 2 + 2;
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
            })()}


            {/* Hover crosshair */}
            {hover && (
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
                {/* Tooltip */}
                {(() => {
                  const tipW = 130;
                  const tipH = 44;
                  const left = hover.x + 12 + tipW > PAD_L + plotWidth ? hover.x - 12 - tipW : hover.x + 12;
                  const top = Math.max(PAD_T + 4, yOfH(hover.h) - tipH - 10);
                  return (
                    <g>
                      <rect
                        x={left}
                        y={top}
                        width={tipW}
                        height={tipH}
                        rx={6}
                        fill="oklch(0.18 0.02 250 / 0.92)"
                      />
                      <text x={left + 10} y={top + 18} fontSize="12" fill="white">
                        {fmtTime(hover.t)}
                      </text>
                      <text x={left + 10} y={top + 35} fontSize="13" fontWeight={600} fill="white">
                        {hover.h.toFixed(2)} m
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}
          </svg>

          <div className="px-4 pb-3 text-right text-xs text-muted-foreground">
            Données : Dieppe · superposition à l'échelle sur la structure (0 m = chart datum)
          </div>
        </div>
      </div>
    </div>
  );
}
