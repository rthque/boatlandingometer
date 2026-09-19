import { WavesIcon, WindIcon } from "lucide-react";
import { useForecast } from "@/hooks/use-forecast";
import { compass, FORECAST_DAYS, FORECAST_SITE } from "@/lib/forecast";

const chip = "rounded px-2 py-0.5 text-xs bg-background/90 backdrop-blur-sm border border-border";

/**
 * Wave and wind forecast for the selected day, under the tide extremes.
 *
 * Kept to two lines. It sits over the drawing, and the drawing is the thing
 * being read — anything more here competes with it. Everything that does not
 * fit goes in the title attributes rather than on screen.
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

  const hs = day.waveHsM;
  const hmax = day.waveHmaxM;
  const wind = day.windKt;
  const gust = day.gustKt;

  return (
    <div className="flex flex-col gap-0.5">
      {hs !== null && (
        <div
          className={`${chip} flex items-center gap-1.5 font-medium`}
          title={
            `Daily peak significant wave height ${hs.toFixed(1)} m` +
            (day.wavePeriodS !== null ? `, period ${day.wavePeriodS.toFixed(0)} s` : "") +
            `. Max is the highest individual wave, estimated as 1.86 × Hs — a statistic of the sea state, not a modelled wave.`
          }
        >
          <WavesIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Hs {hs.toFixed(1)} m</span>
          {hmax !== null && <span className="text-muted-foreground">max ~{hmax.toFixed(1)} m</span>}
        </div>
      )}

      {wind !== null && (
        <div
          className={`${chip} flex items-center gap-1.5 font-medium`}
          title={`Daily maximum wind at 10 m${gust !== null ? `, gusting ${gust.toFixed(0)} kn` : ""}`}
        >
          <WindIcon className="size-3.5 shrink-0 text-muted-foreground" />
          {day.windFromDeg !== null && <span>{compass(day.windFromDeg)}</span>}
          <span>{wind.toFixed(0)} kn</span>
          {gust !== null && <span className="text-muted-foreground">gust {gust.toFixed(0)}</span>}
        </div>
      )}

      {!FORECAST_SITE.exact && (hs !== null || wind !== null) && (
        <div
          className={`${chip} text-muted-foreground`}
          title="The forecast point is an approximate offshore position, not the structure itself. Tides are unaffected — they are computed for Dieppe."
        >
          approx. position
        </div>
      )}
    </div>
  );
}
