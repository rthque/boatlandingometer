// Wave and wind forecast for the site.
//
// This is the only part of the app that needs the network, and it is the only
// part that is allowed to fail. Tides are computed locally from harmonic
// constituents (see tides.ts) and must stay that way; a forecast cannot be, so
// it is fetched, cached, and rendered as "unavailable" rather than taking the
// page with it when the request does not come back.
//
// Open-Meteo: free, no API key, CORS-enabled. That combination is what makes it
// usable from a static site with no server and no credentials to hide.

/**
 * Where the forecast is taken.
 *
 * NOT the tide reference. Tides stay on Dieppe (see DIEPPE in views.ts) because
 * that is the harmonic station; waves are read at the structure, because
 * significant height in a sheltered harbour and significant height in the open
 * sea a few miles out are not the same number, and it is the second one that
 * decides whether anybody goes down to the splash zone.
 */
export const FORECAST_SITE = {
  latitude: 50.03,
  longitude: 1.2,
  /**
   * True once the exact position of the structure is filled in above. While
   * this is false the panel says so, because a wave height is worth nothing
   * without knowing which patch of sea it belongs to.
   */
  exact: false,
};

const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

/** Open-Meteo's marine model runs about a week out; past that there is nothing. */
export const FORECAST_DAYS = 7;

/**
 * Highest individual wave in a sea state, from the significant height.
 *
 * Hs is the mean of the highest third, not a ceiling — the biggest wave in the
 * state is roughly twice it, and that is the one that reaches a person on the
 * ladder. For Rayleigh-distributed heights over N waves the ratio is
 * 0.5·√(2·ln N); N ≈ 1000 waves in a three-hour sea state gives 1.86, which is
 * the usual working figure. It is an estimate from a distribution, not a
 * forecast of a particular wave, and the UI labels it as such.
 */
const HMAX_OVER_HS = 1.86;

export type DayForecast = {
  /** Local calendar day, yyyy-MM-dd. */
  date: string;
  /** Daily peak significant wave height, metres. */
  waveHsM: number | null;
  /** Highest individual wave, metres — derived from Hs, not modelled. */
  waveHmaxM: number | null;
  /** Daily peak wave period, seconds. */
  wavePeriodS: number | null;
  /** Daily maximum sustained wind at 10 m, knots. */
  windKt: number | null;
  /** Daily maximum gust at 10 m, knots. */
  gustKt: number | null;
  /** Dominant wind direction, degrees the wind blows FROM. */
  windFromDeg: number | null;
};

/** Compass point for a bearing in degrees, e.g. 225 -> "SW". */
export function compass(deg: number): string {
  const points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]; // prettier-ignore
  return points[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

// Open-Meteo returns daily blocks as parallel arrays: time[] plus one array per
// variable. Nothing here trusts that shape — a missing or short array yields
// nulls for that field rather than an exception, so one endpoint changing shape
// degrades the panel instead of blanking the app.
type DailyBlock = { time?: unknown; [k: string]: unknown };

function column(block: DailyBlock | undefined, name: string, len: number): (number | null)[] {
  const raw = block?.[name];
  if (!Array.isArray(raw)) return Array(len).fill(null);
  return Array.from({ length: len }, (_, i) => {
    const v = raw[i];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  });
}

function days(block: DailyBlock | undefined): string[] {
  const raw = block?.time;
  return Array.isArray(raw) ? raw.filter((d): d is string => typeof d === "string") : [];
}

async function getJson(url: string, signal?: AbortSignal): Promise<{ daily?: DailyBlock }> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${new URL(url).hostname} returned ${res.status}`);
  return res.json();
}

/**
 * One request per endpoint, both for the same days and the same timezone so the
 * two line up on the calendar the app already shows. Timezone matters: asked in
 * UTC, a "daily maximum" would straddle two local days.
 */
export async function fetchForecast(signal?: AbortSignal): Promise<DayForecast[]> {
  const common =
    `latitude=${FORECAST_SITE.latitude}&longitude=${FORECAST_SITE.longitude}` +
    `&timezone=Europe%2FParis&forecast_days=${FORECAST_DAYS}`;

  const [marine, weather] = await Promise.all([
    getJson(`${MARINE_URL}?${common}&daily=wave_height_max,wave_period_max`, signal),
    getJson(
      `${WEATHER_URL}?${common}&daily=wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn`,
      signal,
    ),
  ]);

  // The two endpoints should agree on the calendar; if they disagree, the wind
  // block leads and marine values are matched by date rather than by index.
  const dates = days(weather.daily).length ? days(weather.daily) : days(marine.daily);
  const n = dates.length;

  const marineDates = days(marine.daily);
  const hs = column(marine.daily, "wave_height_max", marineDates.length);
  const period = column(marine.daily, "wave_period_max", marineDates.length);
  const byDateHs = new Map(marineDates.map((d, i) => [d, hs[i]]));
  const byDatePeriod = new Map(marineDates.map((d, i) => [d, period[i]]));

  const wind = column(weather.daily, "wind_speed_10m_max", n);
  const gust = column(weather.daily, "wind_gusts_10m_max", n);
  const dir = column(weather.daily, "wind_direction_10m_dominant", n);

  return dates.map((date, i) => {
    const waveHsM = byDateHs.get(date) ?? null;
    return {
      date,
      waveHsM,
      waveHmaxM: waveHsM === null ? null : waveHsM * HMAX_OVER_HS,
      wavePeriodS: byDatePeriod.get(date) ?? null,
      windKt: wind[i],
      gustKt: gust[i],
      windFromDeg: dir[i],
    };
  });
}
