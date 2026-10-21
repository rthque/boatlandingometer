import { WavesIcon, WindIcon } from "lucide-react";
import { useForecast } from "@/hooks/use-forecast";
import { useT } from "@/hooks/use-lang";
import {
  FORECAST_DAYS,
  FORECAST_SITE,
  hsIsHigh,
  windIsHigh,
  WORK_END_H,
  WORK_START_H,
} from "@/lib/forecast";

const surface = "rounded text-xs bg-background/90 backdrop-blur-sm border border-border";
/** One-line states (unavailable, out of range) — same height as an extreme row. */
const chip = `${surface} px-2 py-0.5`;
/** The three-line block. Its own padding, rather than chip's plus an override:
    two padding utilities in one class string are resolved by stylesheet order,
    not by the order they are written in. */
const panel = `${surface} px-2 py-1`;

/**
 * Leads a row whose peak is at or over its threshold.
 *
 * An emoji rather than a lucide icon on purpose: every icon on this panel is
 * the same muted grey as the text it sits in, which is right for a label and
 * wrong for a warning. This has to carry at arm's length, on a deck, in
 * daylight — colour is the only thing that does that at 13 px.
 *
 * It takes its own `title`: the row's tooltip explains the figure, this one
 * says what the mark means, and hovering the mark should answer that question
 * rather than the other one.
 */
function AlertMark({ title }: { title: string }) {
  return (
    <span role="img" aria-label={title} title={title} className="shrink-0 text-[13px] leading-none">
      🛑
    </span>
  );
}

/**
 * Wave and wind forecast for the selected day, under the tide extremes.
 *
 * Kept small. It sits over the drawing, and the drawing is the thing being
 * read — anything more here competes with it. Everything that does not fit goes
 * in the title attributes rather than on screen.
 *
 * The one thing that could not go in a tooltip is the window: these are peaks
 * over 08:00–18:00, not over the day, and a number whose span you have to guess
 * is worse than no number. So it gets a header line, and the three lines are
 * banded into one block rather than floating as separate chips — the header
 * has to visibly govern the two rows under it.
 *
 * It renders nothing at all while the first request is in flight, so the panel
 * appears once rather than flickering through a skeleton on every load.
 */
export function ForecastPanel({
  selectedDate,
  showWaves,
  setShowWaves,
}: {
  selectedDate: Date;
  /** Whether the forecast waves are drawn on the chart. */
  showWaves: boolean;
  setShowWaves: (fn: (v: boolean) => boolean) => void;
}) {
  const { day, outOfRange, isLoading, isError } = useForecast(selectedDate);
  const t = useT();

  if (isLoading) return null;

  if (isError) {
    return (
      <div className={`${chip} text-muted-foreground`} title={t.fcUnavailableTitle}>
        {t.fcUnavailable}
      </div>
    );
  }

  if (outOfRange) {
    return <div className={`${chip} text-muted-foreground`}>{t.fcCovers(FORECAST_DAYS)}</div>;
  }

  if (!day) return null;

  const { waveHsM: hs, waveHmaxM: hmax, windMs: wind, gustMs: gust } = day;
  if (hs === null && wind === null) return null;

  const window = t.fcWindow;
  const fullHours = WORK_END_H - WORK_START_H + 1;
  const partial =
    day.hoursCovered > 0 && day.hoursCovered < fullHours
      ? t.fcPartial(day.hoursCovered, fullHours)
      : "";

  return (
    <div className={`${panel} flex flex-col gap-0.5`}>
      <div
        className="text-[10px] leading-tight text-muted-foreground"
        title={t.fcPeakTitle(window, partial)}
      >
        {t.fcPeak(window)}
      </div>

      {hs !== null && (
        <div
          className="flex items-center gap-1.5 font-medium"
          title={t.fcHsTitle({
            hs,
            window,
            hour: day.waveHourH !== null ? t.fcHour(day.waveHourH) : null,
            periodS: day.wavePeriodS,
            high: hsIsHigh(hs),
            partial,
          })}
        >
          {hsIsHigh(hs) && <AlertMark title={t.fcHsAlert} />}
          {/* Tinted while the band is drawn, so the row reads as its legend. */}
          <WavesIcon
            className={`size-3.5 shrink-0 ${showWaves ? "text-[var(--wave-crest)]" : "text-muted-foreground"}`}
          />
          <span>{t.fcHs(hs)}</span>
          {hmax !== null && <span className="text-muted-foreground">{t.fcHmax(hmax)}</span>}
        </div>
      )}

      {wind !== null && (
        <div
          className="flex items-center gap-1.5 font-medium"
          title={t.fcWindTitle({
            window,
            hour: day.windHourH !== null ? t.fcHour(day.windHourH) : null,
            gust,
            high: windIsHigh(wind),
            partial,
          })}
        >
          {windIsHigh(wind) && <AlertMark title={t.fcWindAlert} />}
          <WindIcon className="size-3.5 shrink-0 text-muted-foreground" />
          {day.windFromDeg !== null && <span>{t.fcCompass(day.windFromDeg)}</span>}
          <span>{t.fcWind(wind)}</span>
          {gust !== null && <span className="text-muted-foreground">{t.fcGust(gust)}</span>}
        </div>
      )}

      {/* The switch for the band. It was the wave row's icon first, which
          nobody could tell from a label: every icon on this panel is one.
          A switch with words says both that it can be pressed and what
          pressing it does, in either state, without a tooltip — which a
          phone does not have. It sits under a rule so it reads as a control
          and not as a fourth figure, and it is only here when there are
          waves to draw. The after: inset grows the target to a finger. */}
      {hs !== null && (
        <div className="mt-0.5 border-t border-border pt-1">
          <button
            type="button"
            role="switch"
            aria-checked={showWaves}
            title={t.fcSwitchTitle(showWaves)}
            onClick={() => setShowWaves((v) => !v)}
            className="relative -mx-1 flex w-[calc(100%+0.5rem)] cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-[11px] font-medium leading-tight hover:bg-accent after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
          >
            <span
              aria-hidden
              className={`relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full border transition-colors ${
                showWaves ? "border-transparent bg-[var(--wave-crest)]" : "border-border bg-muted"
              }`}
            >
              <span
                className={`absolute left-0 size-2.5 rounded-full shadow-sm transition-transform ${
                  showWaves
                    ? "translate-x-[11px] bg-[var(--wave-crest-ink)]"
                    : "translate-x-px bg-muted-foreground"
                }`}
              />
            </span>
            {t.fcSwitch}
          </button>
        </div>
      )}

      {!FORECAST_SITE.exact && (
        <div className="text-[10px] leading-tight text-muted-foreground" title={t.fcApproxTitle}>
          {t.fcApprox}
        </div>
      )}
    </div>
  );
}
