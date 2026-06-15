import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import chartDatumAsset from "@/assets/jacket-structure.png.asset.json";

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
// Calibration from jacket-structure.png (1186x1512):
// 10m mark (red bands) at y=366 -> frac=0.2421
// 0m mark (arrow tip) at y=1244 -> frac=0.8227
const CALIB: { h: number; frac: number }[] = [
  { h: 10, frac: 0.2421 },
  { h: 0, frac: 0.8227 },
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
  // Chart geometry — y-axis spans 0..10.5m so 0m is at the bottom and 10m near the top.
  const Y_MIN = 0;
  const Y_MAX = 10.5;
  const IMG_RATIO = 1186 / 1512;

  // Compact padding for mobile — maximise usable area
  const PAD_L = 42;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 24;

  const [size, setSize] = useState({ width: 900, height: 700 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Measure container
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({
          width: Math.max(360, Math.floor(e.contentRect.width)),
          height: Math.max(400, Math.floor(e.contentRect.height)),
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Prevent page scroll — tool is fixed in viewport
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, []);

  const width = size.width;
  const totalHeight = size.height;
  const plotHeight = Math.max(300, totalHeight - PAD_T - PAD_B);
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
    if (e.pointerType === "touch") return; // no hover on touch
    const { x } = updateFromPointer(e);
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

  const yTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const xTicks = Array.from({ length: 13 }, (_, i) => i * 2);

  return (
    <div className="h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-xl px-2 h-full flex flex-col">
        <div
          ref={containerRef}
          className="relative flex-1 rounded-md border border-border bg-card"
          style={{ overflow: "hidden" }}
        >
          <svg
            width={width}
            height={totalHeight}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => { setHover(null); }}
            style={{ display: "block", cursor: "crosshair", touchAction: "auto" }}
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
                  {/* Wide invisible hit area for touch/mouse dragging */}
                  <rect
                    x={PAD_L}
                    y={yLine - 22}
                    width={plotWidth}
                    height={44}
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
                      const { y } = updateFromPointer(e);
                      const h = Y_MAX - ((y - PAD_T) / plotHeight) * (Y_MAX - Y_MIN);
                      setTargetHeight(Math.max(Y_MIN, Math.min(Y_MAX, h)));
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
                  {/* Touch grip handle on the left */}
                  <g pointerEvents="none">
                    <rect
                      x={PAD_L - 2}
                      y={yLine - 16}
                      width={30}
                      height={32}
                      rx={8}
                      fill="oklch(0.6 0.22 25)"
                      stroke="white"
                      strokeWidth={1.5}
                    />
                    {[-5, 0, 5].map((dy) => (
                      <line
                        key={dy}
                        x1={PAD_L + 7}
                        x2={PAD_L + 19}
                        y1={yLine + dy}
                        y2={yLine + dy}
                        stroke="white"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      />
                    ))}
                  </g>

                  {/* Crossing time labels (yellow chips) */}
                  {crossings.map((tc, i) => {
                    const cx = xOfT(tc);
                    // Always render crossing time chips above the line so they
                    // don't collide with the low-tide duration chip below.
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

                  {/* Low-tide interval labels (duration under target height) */}
                  {(() => {
                    const segs: { t1: number; t2: number }[] = [];
                    const bounds = [0, ...crossings, 24];
                    for (let i = 0; i < bounds.length - 1; i++) {
                      const a = bounds[i];
                      const b = bounds[i + 1];
                      const mid = (a + b) / 2;
                      if (tideHeight(mid) < targetHeight) segs.push({ t1: a, t2: b });
                    }
                    const fmtDur = (h: number) => {
                      const total = Math.round(h * 60);
                      const hh = Math.floor(total / 60);
                      const mm = total % 60;
                      return hh > 0 ? `${hh}h${String(mm).padStart(2, "0")}` : `${mm} min`;
                    };
                    return segs.map((s, i) => {
                      const x1 = xOfT(s.t1);
                      const x2 = xOfT(s.t2);
                      const cx = (x1 + x2) / 2;
                      const w = x2 - x1;
                      if (w < 36) return null;
                      const dur = fmtDur(s.t2 - s.t1);
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


        </div>
      </div>
    </div>
  );
}
