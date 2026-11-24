import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import type { PlotGeom } from "@/lib/geom";
import { DATE_MAX, DATE_MIN, fracToHeight, heightToFrac, shiftDay } from "@/lib/tide-math";
import { DAY_SEA_IMG, DIEPPE, VIEWS, type ViewId } from "@/lib/views";
import { useCoefByDay } from "@/hooks/use-tide-data";
import { useDayModel, type DayModel } from "@/hooks/use-day-model";
import { useTimeLapse } from "@/hooks/use-time-lapse";
import { usePlotSize } from "@/hooks/use-plot-size";
import { useTheme } from "@/hooks/use-theme";
import { LangContext, useLangState } from "@/hooks/use-lang";
import { useTouchUI } from "@/hooks/use-touch-ui";
import { useSwipe } from "@/hooks/use-swipe";
import { useBackCloses } from "@/hooks/use-back-closes";
import { DayHint, SwipeHints } from "@/components/tide/SwipeHints";
import { DaySlide, DaySlideHtml, type DayPage } from "@/components/tide/DaySlide";
import { SceneDefs, SkyLayer, WaterVeil } from "@/components/tide/SeaScene";
import { SkyBodies, SkyTracks } from "@/components/tide/SkyTrack";
import { makeCoefDayButton } from "@/components/tide/CoefDayButton";
import { ViewSwitcher } from "@/components/tide/ViewSwitcher";
import { ExtremesList } from "@/components/tide/ExtremesList";
import { ForecastPanel } from "@/components/tide/ForecastPanel";
import { WaveBandFill, WaveCrest } from "@/components/tide/WaveBand";
import { crestAbove, hsAtHour, hsIsHigh, windIsHigh } from "@/lib/forecast";
import { Controls } from "@/components/tide/Controls";
import { BackgroundLayer, NightBands } from "@/components/tide/BackgroundLayer";
import { AxisGrid } from "@/components/tide/AxisGrid";
import { TideCurve } from "@/components/tide/TideCurve";
import { Wc59Overlay } from "@/components/tide/Wc59Overlay";
import { HeightLine, HeightMarks } from "@/components/tide/HeightLine";
import { NowMarker } from "@/components/tide/NowMarker";
import { HoverTooltip } from "@/components/tide/HoverTooltip";
import { SunTimes } from "@/components/tide/SunTimes";

export const Route = createFileRoute("/")({
  component: Index,
});

/** The language is held above the app, so every panel — portals included — reads it. */
function Index() {
  const [lang, setLang] = useLangState();
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return (
    <LangContext.Provider value={value}>
      <TideApp />
    </LangContext.Provider>
  );
}

function TideApp() {
  const [view, setView] = useState<ViewId>("FOU");
  const viewConfig = VIEWS[view];
  const [theme, , toggleTheme] = useTheme();
  // The IRL photo carries its own sky and sea, so the drawn scene would fight
  // it; the CAD views are the ones that need a world around them.
  const showScene = view !== "IRL";

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    if (today < DATE_MIN) return DATE_MIN;
    if (today > DATE_MAX) return DATE_MAX;
    return today;
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(selectedDate);
  const [aboutOpen, setAboutOpen] = useState(false);
  const touchUI = useTouchUI();

  // Declared up here because the scene geometry below now depends on the
  // target height: in the photographic day view the sea surface IS the red
  // line, so the waterline is no longer a constant.
  const [hover, setHover] = useState<{ x: number; t: number; h: number } | null>(null);
  const [targetHeight, setTargetHeight] = useState<number | null>(null);
  const [showWC59, setShowWC59] = useState(false);
  // Off by default: it is an explanation, not part of the reading, and a crew
  // opening the app to check a window should see only what they came for.
  const [showSky, setShowSky] = useState(false);
  // On by default, unlike the sky: the sky explains the tide, the waves change
  // the answer — the time the water really stays below a height. With no
  // forecast for the day there is nothing to draw and the chart is the tide's.
  const [showWaves, setShowWaves] = useState(true);
  const [draggingLine, setDraggingLine] = useState(false);

  const coefByDay = useCoefByDay(datePickerOpen, calMonth);
  const coefDayButton = useMemo(() => makeCoefDayButton(coefByDay), [coefByDay]);

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

  /**
   * Photographic day scene: only when a day plate exists, only in the day
   * theme, and never over the IRL photo, which brings its own sky and sea.
   *
   * Everything this flag switches is additive. With no plate the day view is
   * byte-for-byte the drawn scene it always was, which is what makes deleting
   * the file a complete rollback.
   */
  const dayPhotoScene = showScene && theme === "day" && DAY_SEA_IMG !== null;

  /**
   * The height the sea surface is drawn at.
   *
   * Chart datum everywhere except the photographic day scene, where the water
   * is the tide the user is pointing at — drag the red line and the sea really
   * does rise up the legs. Datum stays the anchor for the night scene because
   * there the sea is scenery the day's tide rides on top of; here it is the
   * subject.
   */
  const seaLevelH = dayPhotoScene ? (targetHeight ?? 0) : 0;
  const waterY = yOfH(seaLevelH);
  // The sea recedes to a horizon at eye level — roughly the deck of the CTV you
  // would be looking from. Expressing it as a height rather than a screen
  // fraction keeps it consistent when a view zooms in. In the photographic day
  // scene the plate's own horizon rides the waterline instead: the picture is
  // an over-under, so its sky/sea boundary IS the surface the legs enter.
  const HORIZON_M = 4;
  const horizonY = dayPhotoScene ? waterY : Math.max(PAD_T + 8, yOfH(HORIZON_M));

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

  // Everything the chart draws that belongs to the day rather than to the
  // structure, for the selected day — and on a phone, while a finger is on the
  // chart, for the days either side, so a sideways swipe can slide them in.
  const geo = { xOfT, yOfH, key: `${width}|${plotHeight}|${Y_MIN}|${Y_MAX}` };
  const day = useDayModel(selectedDate, geo, targetHeight, showWaves) as DayModel;
  const { allExtremes, visibleExtremes, tideHeight, forecastDay } = day;

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

  /** A 🛑 on the panel: it is then ~35 px wider than on an ordinary day. */
  const flagged =
    !!forecastDay &&
    ((forecastDay.waveHsM !== null && hsIsHigh(forecastDay.waveHsM)) ||
      (forecastDay.windMs !== null && windIsHigh(forecastDay.windMs)));
  /** Highest estimated water at hour t on a day, with the waves on; else null. */
  const crestOf = (m: DayModel, t: number): number | null => {
    if (!m.waveOn || !m.waveSeries) return null;
    const hs = hsAtHour(m.waveSeries, t);
    return hs === null ? null : m.tideHeight(t) + crestAbove(hs);
  };
  const crestAt = (t: number) => crestOf(day, t);

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

  const {
    animState,
    setAnimState,
    animMode,
    setAnimMode,
    animT,
    animActive,
    clockDriven,
    startAnim,
    stopAnim,
    speedPos,
    setSpeedPos,
    secPerDay,
  } = useTimeLapse(selectedDate, setSelectedDate);

  useEffect(() => {
    if (targetHeight === null && allExtremes.length > 0) {
      const initial = isToday && nowH !== null ? nowH : tideHeight(12);
      setTargetHeight(Math.max(0, Math.min(10, initial)));
    }
  }, [allExtremes, targetHeight, isToday, nowH, tideHeight]);

  // In clock mode the red height line follows the tide. Day mode deliberately
  // does NOT touch it: holding one level still while the dates run past is the
  // whole point of that mode, so the line stays wherever the user put it and
  // the crossings under it are recomputed for each new day.
  useEffect(() => {
    if (!clockDriven) return;
    setTargetHeight(Math.max(0, Math.min(10, tideHeight(animT))));
  }, [clockDriven, animT, tideHeight]);

  // The "now" marker shows the animation clock in clock mode; in day mode there
  // is no simulated time of day, so it falls back to the real one and appears
  // only on the day that really is today — which is a useful thing to see go
  // past while scanning.
  const markerT = clockDriven ? animT : nowT;
  const markerH = clockDriven ? tideHeight(animT) : nowH;
  const showMarker = clockDriven || (isToday && nowH !== null);

  // The bodies sit at the hour the marker uses. On a date that is not today
  // there is no "now" on the chart, but "where the sky is at this time of day,
  // on that date" is still true and useful — and it is what makes the day-scan
  // mode show the phase turning over while the dates run.
  const skyHour = clockDriven ? animT : nowT;

  const yTicks = useMemo(() => {
    const step = view === "FOU" ? 5 : view === "IRL" ? 2 : 1;
    const ticks: number[] = [];
    const start = Math.max(0, Math.ceil(Y_MIN / step) * step);
    for (let v = start; v <= Y_MAX; v += step) ticks.push(v);
    return ticks;
  }, [Y_MIN, Y_MAX, view]);
  const xTicks = Array.from({ length: 13 }, (_, i) => i * 2);

  // Touch only (see useTouchUI): swipes on the chart's empty ground turn the
  // day over and pull in the calendar and the info, and the phone's Back
  // closes whichever of the two is open. On a mouse none of this exists.
  //
  // The sideways swipe is a carousel: the day's layers slide with the finger
  // and the next or previous day comes in behind them. Its pages exist only
  // while a finger is on the chart (`peek`); the rest of the time the chart is
  // the selected day alone, as on a mouse.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prevDay = useMemo(() => shiftDay(selectedDate, -1), [selectedDate]);
  const nextDay = useMemo(() => shiftDay(selectedDate, 1), [selectedDate]);
  const [peek, setPeek] = useState(false);
  const prevModel = useDayModel(touchUI && peek ? prevDay : null, geo, targetHeight, showWaves);
  const nextModel = useDayModel(touchUI && peek ? nextDay : null, geo, targetHeight, showWaves);
  const pages: DayPage<DayModel>[] | null = touchUI
    ? [
        ...(prevModel
          ? [{ key: prevModel.key, dx: -plotWidth, role: "prev" as const, m: prevModel }]
          : []),
        { key: day.key, dx: 0, role: "cur" as const, m: day },
        ...(nextModel
          ? [{ key: nextModel.key, dx: plotWidth, role: "next" as const, m: nextModel }]
          : []),
      ]
    : null;
  useSwipe(rootRef, {
    enabled: touchUI && !datePickerOpen && !aboutOpen,
    pageWidth: plotWidth,
    canPrev: prevDay !== null,
    canNext: nextDay !== null,
    onPeek: setPeek,
    onPrev: () => prevDay && setSelectedDate(prevDay),
    onNext: () => nextDay && setSelectedDate(nextDay),
    onDown: () => {
      setCalMonth(selectedDate);
      setDatePickerOpen(true);
    },
    onUp: () => setAboutOpen(true),
  });
  useBackCloses(datePickerOpen, () => setDatePickerOpen(false), touchUI);
  useBackCloses(aboutOpen, () => setAboutOpen(false), touchUI);

  /**
   * The "now" marker on a page. The selected day's is the time-lapse clock or
   * the real time, as it always was. A neighbour shows the real time if it is
   * today — swipe from yesterday and today comes in with its marker on — and
   * nothing while the clock runs, which belongs to the selected day alone.
   */
  const todayKey = format(new Date(), "yyyy-MM-dd");
  /**
   * The incoming day's chip: above the sunrise / sunset row (which sits 28 px
   * over the 10 m line, see SunTimes), but kept within the middle of the
   * screen, clear of the panels in its upper corners and of the hour labels.
   */
  const dayHintTop = Math.round(
    Math.min(Math.max(yOfH(10) - 28 - 12 - 38, totalHeight * 0.3), totalHeight * 0.6),
  );
  const markerFor = (m: DayModel, role: "prev" | "cur" | "next") => {
    if (role === "cur") {
      return (
        showMarker &&
        markerH !== null && (
          <NowMarker geom={geom} markerT={markerT} markerH={markerH} crestH={crestAt(markerT)} />
        )
      );
    }
    if (clockDriven || m.key !== todayKey) return null;
    return (
      <NowMarker
        geom={geom}
        markerT={nowT}
        markerH={m.tideHeight(nowT)}
        crestH={crestOf(m, nowT)}
      />
    );
  };

  return (
    <div ref={rootRef} className="h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="w-full h-full flex flex-col">
        {touchUI && <SwipeHints />}
        {/* One column so the forecast always sits directly under the last
            extreme, whether the day has three or four of them. */}
        <div className="absolute top-24 left-2 z-20 flex flex-col gap-1.5">
          {/* The tide rows stretch to the forecast panel, so the two line up —
              except where that would run them into the control stack: on a
              🛑 day, when the panel is ~198 px, and on phones narrower than
              370 px, where even an ordinary panel (up to ~175 px) leaves the
              speed panel no room. There they keep their own width instead. */}
          <div className={flagged ? "self-start" : "max-[370px]:self-start"}>
            <ExtremesList extremes={visibleExtremes} />
          </div>
          <ForecastPanel
            selectedDate={selectedDate}
            showWaves={showWaves}
            setShowWaves={setShowWaves}
          />
        </div>
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
          showSky={showSky}
          setShowSky={setShowSky}
          setTargetHeight={setTargetHeight}
          animState={animState}
          setAnimState={setAnimState}
          animMode={animMode}
          setAnimMode={setAnimMode}
          animActive={animActive}
          startAnim={startAnim}
          stopAnim={stopAnim}
          speedPos={speedPos}
          setSpeedPos={setSpeedPos}
          secPerDay={secPerDay}
          theme={theme}
          toggleTheme={toggleTheme}
          touchUI={touchUI}
          aboutOpen={aboutOpen}
          setAboutOpen={setAboutOpen}
        />
        <div
          ref={containerRef}
          className="relative flex-1 rounded-md border border-border bg-card"
          style={{ overflow: "hidden" }}
        >
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
                <stop offset="0%" style={{ stopColor: "var(--tide-fill-top)" }} />
                <stop offset="100%" style={{ stopColor: "var(--tide-fill-deep)" }} />
              </linearGradient>
              <SceneDefs geom={geom} horizonY={horizonY} waterY={waterY} dayPhoto={dayPhotoScene} />
            </defs>

            {showScene && (
              <SkyLayer
                geom={geom}
                horizonY={horizonY}
                waterY={waterY}
                theme={theme}
                dayPhoto={dayPhotoScene}
              />
            )}

            {/* The tracks go behind the structure, the bodies in front of it —
                see SkyTrack.tsx for why the two are layered differently. */}
            {showScene && showSky && (
              <DaySlide pages={pages} cur={day}>
                {(m, role) => (
                  <SkyTracks
                    geom={geom}
                    horizonY={horizonY}
                    date={m.date}
                    hour={skyHour}
                    lat={DIEPPE.latitude}
                    lon={DIEPPE.longitude}
                    idSuffix={role === "cur" ? undefined : `-${role}`}
                  />
                )}
              </DaySlide>
            )}

            <BackgroundLayer
              geom={geom}
              img={viewConfig.img}
              imageLeft={imageLeft}
              imageTop={imageTop}
              imageDisplayWidth={imageDisplayWidth}
              imageDisplayHeight={imageDisplayHeight}
              bands={
                <DaySlide pages={pages} cur={day}>
                  {(m) => <NightBands geom={geom} sunriseH={m.sunriseH} sunsetH={m.sunsetH} />}
                </DaySlide>
              }
              waterY={waterY}
              scene={showScene}
              theme={theme}
              dayPhoto={dayPhotoScene}
              simplify={animActive}
            />

            {showScene && showSky && (
              <DaySlide pages={pages} cur={day}>
                {(m) => (
                  <SkyBodies
                    geom={geom}
                    horizonY={horizonY}
                    date={m.date}
                    hour={skyHour}
                    lat={DIEPPE.latitude}
                    lon={DIEPPE.longitude}
                  />
                )}
              </DaySlide>
            )}

            {showScene && (
              <WaterVeil
                geom={geom}
                waterY={waterY}
                dayPhoto={dayPhotoScene}
                simplify={animActive}
              />
            )}

            <AxisGrid geom={geom} yTicks={yTicks} xTicks={xTicks} part="y" />
            <DaySlide pages={pages} cur={day}>
              {() => <AxisGrid geom={geom} yTicks={yTicks} xTicks={xTicks} part="x" />}
            </DaySlide>

            <DaySlide pages={pages} cur={day}>
              {(m) => (
                <>
                  {m.waveOn && m.waveSeries && (
                    <WaveBandFill geom={geom} tideHeight={m.tideHeight} series={m.waveSeries} />
                  )}

                  <TideCurve
                    geom={geom}
                    seaPath={m.seaPath}
                    curvePath={m.curvePath}
                    visibleExtremes={m.visibleExtremes}
                    dayPhoto={dayPhotoScene}
                  />

                  {m.waveOn && m.waveSeries && (
                    <WaveCrest geom={geom} tideHeight={m.tideHeight} series={m.waveSeries} />
                  )}
                </>
              )}
            </DaySlide>

            {showWC59 && targetHeight !== null && (
              <Wc59Overlay
                geom={geom}
                targetHeight={targetHeight}
                bowBerthFrac={viewConfig.bowBerthFrac}
                imageLeft={imageLeft}
                imageDisplayWidth={imageDisplayWidth}
                dayPhoto={dayPhotoScene}
                simplify={animActive}
              />
            )}

            {targetHeight !== null && (
              <HeightLine
                geom={geom}
                targetHeight={targetHeight}
                setTargetHeight={setTargetHeight}
                draggingLine={draggingLine}
                setDraggingLine={setDraggingLine}
                marks={
                  <DaySlide pages={pages} cur={day}>
                    {(m) => (
                      <HeightMarks
                        geom={geom}
                        targetHeight={targetHeight}
                        crossings={m.crossings}
                        levelAt={m.levelAt}
                        waveAdjusted={m.waveAdjusted}
                        sunriseH={m.sunriseH}
                        sunsetH={m.sunsetH}
                      />
                    )}
                  </DaySlide>
                }
              />
            )}

            <DaySlide pages={pages} cur={day}>
              {markerFor}
            </DaySlide>

            {hover && <HoverTooltip geom={geom} hover={hover} crestH={crestAt(hover.t)} />}
          </svg>
          <DaySlideHtml pages={pages} cur={day}>
            {(m, role) => (
              <>
                <SunTimes geom={geom} sunriseH={m.sunriseH} sunsetH={m.sunsetH} />
                {role !== "cur" && <DayHint role={role} date={m.date} top={dayHintTop} />}
              </>
            )}
          </DaySlideHtml>
        </div>
      </div>
    </div>
  );
}
