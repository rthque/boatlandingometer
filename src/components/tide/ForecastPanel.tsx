import { WavesIcon, WindIcon } from "lucide-react";
import { useForecast } from "@/hooks/use-forecast";
import {
  compass,
  FORECAST_DAYS,
  FORECAST_SITE,
  WORK_END_H,
  WORK_START_H,
  workWindowLabel,
} from "@/lib/forecast";

const surface = "rounded text-xs bg-background/90 backdrop-blur-sm border border-border";
/** One-line states (unavailable, out of range) — same height as an extreme row. */
const chip = `${surface} px-2 py-0.5`;
/** The three-line block. Its own padding, rather than chip's plus an override:
    two padding utilities in one class string are resolved by stylesheet order,
    not by the order they are written in. */
const panel = `${surface} px-2 py-1`;

/** "14:00", from an hour index. */
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

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
export function ForecastPanel({ selectedDate }: { selectedDate: Date }) {
  const { day, outOfRange, isLoading, isError } = useForecast(selectedDate);

  if (isLoading) return null;

  if (isError) {
    return (
      <div className={`${chip} text-muted-foreground`} title="Could not reach the forecast service">
        Forecast unavailable
      </div>
    );
  }

  if (outOfRange) {
    return (
      <div className={`${chip} text-muted-foreground`}>Forecast covers {FORECAST_DAYS} days</div>
    );
  }

  if (!day) return null;

  const { waveHsM: hs, waveHmaxM: hmax, windMs: wind, gustMs: gust } = day;
  if (hs === null && wind === null) return null;

  const window = workWindowLabel();
  const fullHours = WORK_END_H - WORK_START_H + 1;
  const partial =
    day.hoursCovered > 0 && day.hoursCovered < fullHours
      ? ` Only ${day.hoursCovered} of ${fullHours} hours came back, so the peak may be understated.`
      : "";

  return (
    <div className={`${panel} flex flex-col gap-0.5`}>
      <div
        className="text-[10px] leading-tight text-muted-foreground"
        title={`Highest value of each figure between ${window} local time — not the 24 h maximum, which a night swell can set hours before anyone is on the water.${partial}`}
      >
        Peak {window}
      </div>

      {hs !== null && (
        <div
          className="flex items-center gap-1.5 font-medium"
          title={
            `Significant wave height ${hs.toFixed(1)} m, the worst hour of ${window}` +
            (day.waveHourH !== null ? ` (${hourLabel(day.waveHourH)})` : "") +
            (day.wavePeriodS !== null ? `, period ${day.wavePeriodS.toFixed(0)} s` : "") +
            `. Max is the highest individual wave, estimated as 1.86 × Hs — a statistic of the sea state, not a modelled wave.${partial}`
          }
        >
          <WavesIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Hs {hs.toFixed(1)} m</span>
          {hmax !== null && <span className="text-muted-foreground">max ~{hmax.toFixed(1)} m</span>}
        </div>
      )}

      {wind !== null && (
        <div
          className="flex items-center gap-1.5 font-medium"
          title={
            `Strongest sustained wind at 10 m between ${window}` +
            (day.windHourH !== null ? ` (${hourLabel(day.windHourH)})` : "") +
            (gust !== null ? `, strongest gust ${gust.toFixed(1)} m/s` : "") +
            `. Direction is the one blowing at the peak-wind hour.${partial}`
          }
        >
          <WindIcon className="size-3.5 shrink-0 text-muted-foreground" />
          {day.windFromDeg !== null && <span>{compass(day.windFromDeg)}</span>}
          <span>{wind.toFixed(1)} m/s</span>
          {gust !== null && <span className="text-muted-foreground">gust {gust.toFixed(1)}</span>}
        </div>
      )}

      {!FORECAST_SITE.exact && (
        <div
          className="text-[10px] leading-tight text-muted-foreground"
          title="The forecast point is an approximate offshore position, not the structure itself. Tides are unaffected — they are computed for Dieppe."
        >
          approx. position
        </div>
      )}
    </div>
  );
}
