import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import * as SunCalc from "suncalc";
import type { PlotGeom } from "@/lib/geom";
import { DATE_MAX, DATE_MIN, fracToHeight, heightToFrac, makeTideHeight } from "@/lib/tide-math";
import { DIEPPE, VIEWS, type ViewId } from "@/lib/views";
import { useTideExtremes, useCoefByDay } from "@/hooks/use-tide-data";
import { useTimeLapse } from "@/hooks/use-time-lapse";
import { usePlotSize } from "@/hooks/use-plot-size";
import { makeCoefDayButton } from "@/components/tide/CoefDayButton";
import { ViewSwitcher } from "@/components/tide/ViewSwitcher";
import { ExtremesList } from "@/components/tide/ExtremesList";
import { Controls } from "@/components/tide/Controls";
import { BackgroundLayer } from "@/components/tide/BackgroundLayer";
import { AxisGrid } from "@/components/tide/AxisGrid";
import { TideCurve } from "@/components/tide/TideCurve";
import { Wc59Overlay } from "@/components/tide/Wc59Overlay";
import { HeightLine } from "@/components/tide/HeightLine";
import { NowMarker } from "@/components/tide/NowMarker";
import { HoverTooltip } from "@/components/tide/HoverTooltip";
import { SunTimes } from "@/components/tide/SunTimes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dieppe Tides — Boatlandingometer" },
      {
        name: "description",
        content: "Dieppe tide times overlaid on the jacket structure (chart datum).",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [view, setView] = useState<ViewId>("FOU");
  const viewConfig = VIEWS[view];

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    if (today < DATE_MIN) return DATE_MIN;
    if (today > DATE_MAX) return DATE_MAX;
    return today;
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(selectedDate);

  const { allExtremes, loading } = useTideExtremes(selectedDate);
  const coefByDay = useCoefByDay(datePickerOpen, calMonth);
  const coefDayButton = useMemo(() => makeCoefDayButton(coefByDay), [coefByDay]);

  const visibleExtremes = useMemo(
    () => allExtremes.filter((p) => p.t >= 0 && p.t <= 24),
    [allExtremes],
  );

  const tideHeight = useMemo(() => makeTideHeight(allExtremes), [allExtremes]);

  // Full-bleed: the schema fills 100% of the viewport. Axis graduations are
  // overlaid directly on the image (with a white halo for legibility) instead
  // of living in white margin bands that would shrink the usable image area.
  const PAD_L = 0;
  const PAD_R = 0;
  const PAD_T = 0;
  const PAD_B = 0;

  const { containerRef, size } = usePlotSize();

  const width = size.width;
  const totalHeight = size.height;
  const plotHeight = Math.max(300, totalHeight - PAD_T - PAD_B);
  const plotWidth = width - PAD_L - PAD_R;

  const { Y_MIN, Y_MAX, imageDisplayWidth, imageDisplayHeight, imageTop, imageLeft } =
    useMemo(() => {
      // Image placement. BL/FOU: fit the whole image to the plot HEIGHT, centered
      // horizontally (sides may crop in portrait). IRL: depends on orientation
      // (see below). Either way the tide axis is derived from the calibration
      // marks (see heightToFrac): a height maps to a fraction of the displayed
      // image, so gridlines and the tide curve line up with the printed "→"
      // arrows regardless of how the image is fitted.
      const cal = viewConfig.calib;
      let imgW: number;
      let imgH: number;
      let imgTop: number;
      let imgLeft: number;
      if (view === "IRL" && plotWidth > plotHeight) {
        // Landscape: filling the width would make this portrait photo far too
        // tall and crop the 10m mark + the sinusoid crest off the top. Instead
        // frame a fixed 0–11m height window so 10m and the whole tide curve stay
        // visible; keep the aspect ratio and center horizontally (side gaps are
        // acceptable in landscape).
        const topFrac = heightToFrac(11, cal);
        const botFrac = heightToFrac(0, cal);
        imgH = plotHeight / (botFrac - topFrac);
        imgW = imgH * viewConfig.ratio;
        imgTop = PAD_T - topFrac * imgH;
        imgLeft = PAD_L + plotWidth / 2 - imgW / 2;
      } else if (view === "IRL") {
        // Portrait: fill the screen width and anchor the BOTTOM of the photo to
        // the bottom of the screen (the top crops if the photo is taller).
        imgW = plotWidth;
        imgH = imgW / viewConfig.ratio;
        imgLeft = PAD_L;
        imgTop = PAD_T + plotHeight - imgH;
      } else {
        imgH = plotHeight; // full image height fills the plot
        imgW = imgH * viewConfig.ratio;
        imgTop = PAD_T;
        imgLeft = PAD_L + plotWidth / 2 - imgW / 2;
      }
      // Heights at the visible top/bottom of the plot (fractions of the displayed
      // image at those screen edges, mapped back through the calibration).
      const fracTop = (PAD_T - imgTop) / imgH;
      const fracBot = (PAD_T + plotHeight - imgTop) / imgH;
      return {
        Y_MIN: fracToHeight(fracBot, cal),
        Y_MAX: fracToHeight(fracTop, cal),
        imageDisplayHeight: imgH,
        imageDisplayWidth: imgW,
        imageTop: imgTop,
        imageLeft: imgLeft,
      };
    }, [view, viewConfig, plotWidth, plotHeight]);

  const xOfT = (t: number) => PAD_L + (t / 24) * plotWidth;
  // Piecewise calibration: a height maps to a fraction of the DISPLAYED image,
  // i.e. its y on screen = image top + frac × image height. This stays exact
  // whether the image fills the plot height (BL/FOU) or overflows it (IRL).
  const yOfH = (h: number) => imageTop + heightToFrac(h, viewConfig.calib) * imageDisplayHeight;
  const tOfX = (x: number) => ((x - PAD_L) / plotWidth) * 24;

  // Convert a pointer event to plot-space pixels (accounts for the SVG being
  // rendered at a different CSS size than its coordinate system).
  const pointerToPlot = (e: React.PointerEvent<SVGElement>) => {
    const svg = (e.currentTarget.ownerSVGElement ?? e.currentTarget) as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * totalHeight;
    return { x, y };
  };

  const geom: PlotGeom = {
    width,
    totalHeight,
    plotWidth,
    plotHeight,
    PAD_L,
    PAD_R,
    PAD_T,
    PAD_B,
    Y_MIN,
    Y_MAX,
    xOfT,
    yOfH,
    tOfX,
    pointerToPlot,
  };

  const curvePath = useMemo(() => {
    const steps = 960;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      const x = xOfT(t);
      const y = yOfH(tideHeight(t));
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, plotHeight, tideHeight, Y_MIN, Y_MAX]);

  const seaPath = useMemo(() => {
    const steps = 960;
    let d = `M ${xOfT(0).toFixed(2)} ${yOfH(Y_MIN).toFixed(2)}`;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      d += ` L ${xOfT(t).toFixed(2)} ${yOfH(tideHeight(t)).toFixed(2)}`;
    }
    d += ` L ${xOfT(24).toFixed(2)} ${yOfH(Y_MIN).toFixed(2)} Z`;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, plotHeight, tideHeight, Y_MIN, Y_MAX]);

  const [hover, setHover] = useState<{ x: number; t: number; h: number } | null>(null);
  const [targetHeight, setTargetHeight] = useState<number | null>(null);
  const [showWC59, setShowWC59] = useState(false);
  const [draggingLine, setDraggingLine] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "touch") return; // no hover on touch
    const { x } = pointerToPlot(e);
    if (x < PAD_L || x > PAD_L + plotWidth) {
      setHover(null);
      return;
    }
    const t = tOfX(x);
    const h = tideHeight(t);
    setHover({ x: xOfT(t), t, h });
  };

  // Times where the tide curve crosses targetHeight.
  const crossings = useMemo(() => {
    if (targetHeight === null) return [];
    const steps = 2880; // 30s resolution
    const xs: number[] = [];
    let prev = tideHeight(0) - targetHeight;
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * 24;
      const curr = tideHeight(t) - targetHeight;
      if (prev === 0 || prev < 0 !== curr < 0) {
        const tPrev = ((i - 1) / steps) * 24;
        const u = prev === curr ? 0 : prev / (prev - curr);
        xs.push(tPrev + u * (24 / steps));
      }
      prev = curr;
    }
    return xs;
  }, [targetHeight, tideHeight]);

  const isToday = useMemo(() => {
    const now = new Date();
    return (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate()
    );
  }, [selectedDate]);

  const [nowT, setNowT] = useState(() => {
    const n = new Date();
    return n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600;
  });

  useEffect(() => {
    if (!isToday) return;
    const tick = () => {
      const n = new Date();
      setNowT(n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const nowH = isToday ? tideHeight(nowT) : null;

  const { animState, setAnimState, animT, animActive, startAnim, stopAnim } = useTimeLapse(
    selectedDate,
    setSelectedDate,
  );

  useEffect(() => {
    if (targetHeight === null && allExtremes.length > 0) {
      const initial = isToday && nowH !== null ? nowH : tideHeight(12);
      setTargetHeight(Math.max(0, Math.min(10, initial)));
    }
  }, [allExtremes, targetHeight, isToday, nowH, tideHeight]);

  // While the animation is active, the red height line follows the tide.
  useEffect(() => {
    if (!animActive) return;
    setTargetHeight(Math.max(0, Math.min(10, tideHeight(animT))));
  }, [animActive, animT, tideHeight]);

  // The "now" marker shows the animation clock while active, else the real time.
  const markerT = animActive ? animT : nowT;
  const markerH = animActive ? tideHeight(animT) : nowH;
  const showMarker = animActive || (isToday && nowH !== null);

  const yTicks = useMemo(() => {
    const step = view === "FOU" ? 5 : view === "IRL" ? 2 : 1;
    const ticks: number[] = [];
    const start = Math.max(0, Math.ceil(Y_MIN / step) * step);
    for (let v = start; v <= Y_MAX; v += step) ticks.push(v);
    return ticks;
  }, [Y_MIN, Y_MAX, view]);
  const xTicks = Array.from({ length: 13 }, (_, i) => i * 2);

  // Sunrise / sunset for the selected day (recomputed daily — SunCalc accounts
  // for the date, so these shift across the seasons over the whole year).
  const { sunriseH, sunsetH } = useMemo(() => {
    const t = SunCalc.getTimes(selectedDate, DIEPPE.latitude, DIEPPE.longitude);
    const toH = (d: Date | null | undefined) =>
      d && !Number.isNaN(d.getTime())
        ? d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
        : null;
    return { sunriseH: toH(t.sunrise), sunsetH: toH(t.sunset) };
  }, [selectedDate]);

  return (
    <div className="h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="w-full h-full flex flex-col">
        <ExtremesList extremes={visibleExtremes} />
        <ViewSwitcher view={view} setView={setView} />
        <Controls
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          datePickerOpen={datePickerOpen}
          setDatePickerOpen={setDatePickerOpen}
          calMonth={calMonth}
          setCalMonth={setCalMonth}
          coefDayButton={coefDayButton}
          showWC59={showWC59}
          setShowWC59={setShowWC59}
          setTargetHeight={setTargetHeight}
          animState={animState}
          setAnimState={setAnimState}
          animActive={animActive}
          startAnim={startAnim}
          stopAnim={stopAnim}
        />
        <div
          ref={containerRef}
          className="relative flex-1 rounded-md border border-border bg-card"
          style={{ overflow: "hidden" }}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60">
              <span className="text-sm text-muted-foreground animate-pulse">Loading tides…</span>
            </div>
          )}
          <svg
            width={width}
            height={totalHeight}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => {
              setHover(null);
            }}
            style={{
              display: "block",
              cursor: "crosshair",
              touchAction: "auto",
            }}
          >
            <defs>
              <clipPath id="plotClip">
                <rect x={PAD_L} y={PAD_T} width={plotWidth} height={plotHeight} />
              </clipPath>
              <linearGradient id="seaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.13 230)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="oklch(0.45 0.15 240)" stopOpacity="0.65" />
              </linearGradient>
            </defs>

            <BackgroundLayer
              geom={geom}
              img={viewConfig.img}
              imageLeft={imageLeft}
              imageTop={imageTop}
              imageDisplayWidth={imageDisplayWidth}
              imageDisplayHeight={imageDisplayHeight}
              sunriseH={sunriseH}
              sunsetH={sunsetH}
            />

            <AxisGrid geom={geom} yTicks={yTicks} xTicks={xTicks} />

            <TideCurve
              geom={geom}
              seaPath={seaPath}
              curvePath={curvePath}
              visibleExtremes={visibleExtremes}
            />

            {showWC59 && targetHeight !== null && (
              <Wc59Overlay
                geom={geom}
                targetHeight={targetHeight}
                landingRightFrac={viewConfig.landingRightFrac}
                imageLeft={imageLeft}
                imageDisplayWidth={imageDisplayWidth}
                animActive={animActive}
                animT={animT}
              />
            )}

            {targetHeight !== null && (
              <HeightLine
                geom={geom}
                targetHeight={targetHeight}
                setTargetHeight={setTargetHeight}
                draggingLine={draggingLine}
                setDraggingLine={setDraggingLine}
                crossings={crossings}
                tideHeight={tideHeight}
                sunriseH={sunriseH}
                sunsetH={sunsetH}
              />
            )}

            {showMarker && markerH !== null && (
              <NowMarker geom={geom} markerT={markerT} markerH={markerH} />
            )}

            {hover && <HoverTooltip geom={geom} hover={hover} />}
          </svg>
          <SunTimes geom={geom} sunriseH={sunriseH} sunsetH={sunsetH} />
        </div>
      </div>
    </div>
  );
}
