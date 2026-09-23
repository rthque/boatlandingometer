// Wave and wind forecast for the site, over the working day.
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
 * Where the forecast is taken: the structure itself, 50°10\'46.9"N 1°10\'21.1"E.
 *
 * NOT the tide reference, and the gap is the point. Tides stay on Dieppe (see
 * DIEPPE in views.ts) because that is the harmonic station, but the structure
 * is 29 km NNE of it, in open Channel. Significant height in a sheltered
 * harbour and significant height 29 km offshore are not the same number, and it
 * is the second one that decides whether anybody goes down to the splash zone.
 *
 * The placeholder this replaced sat 17 km away, which is why the panel wore an
 * "approx. position" chip until the real position arrived.
 */
export const FORECAST_SITE = {
  latitude: 50.179694,
  longitude: 1.172528,
  /**
   * Whether the coordinates above are the structure's own. False makes the
   * panel say so, because a wave height is worth nothing without knowing which
   * patch of sea it belongs to.
   */
  exact: true,
};

/**
 * The working day, in local hours, inclusive at both ends.
 *
 * Everything this module reports is the worst hour inside this window and
 * nothing outside it. That is deliberate and it is the whole reason the module
 * reads hourly series rather than Open-Meteo's daily aggregates: a daily
 * maximum covers 24 h, so a 3 a.m. swell that has died by breakfast still set
 * the number a crew read at 8 a.m. and planned around. The figures came out
 * consistently higher than the sea anyone actually met, which is the worst way
 * for a safety-adjacent number to be wrong — it cries wolf until it is ignored.
 *
 * Both ends inclusive: 18:00 is an hour someone can still be on the ladder.
 */
export const WORK_START_H = 8;
export const WORK_END_H = 18;

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
 *
 * It is applied to the peak hourly Hs, so the sea state it describes is the
 * roughest hour of the working day rather than an average over it.
 */
const HMAX_OVER_HS = 1.86;

export type DayForecast = {
  /** Local calendar day, yyyy-MM-dd. */
  date: string;
  /** Worst hour's significant wave height inside the work window, metres. */
  waveHsM: number | null;
  /** Highest individual wave, metres — derived from Hs, not modelled. */
  waveHmaxM: number | null;
  /** Wave period at that same worst hour, seconds. */
  wavePeriodS: number | null;
  /** Local hour of the peak Hs, 0–23. */
  waveHourH: number | null;
  /** Strongest sustained wind at 10 m inside the work window, m/s. */
  windMs: number | null;
  /** Strongest gust at 10 m inside the work window, m/s. */
  gustMs: number | null;
  /** Direction the wind blows FROM at the peak-wind hour, degrees. */
  windFromDeg: number | null;
  /** Local hour of the peak wind, 0–23. */
  windHourH: number | null;
  /** How many hours of the window the model actually returned, 0–11. */
  hoursCovered: number;
};

/** Compass point for a bearing in degrees, e.g. 225 -> "SW". */
export function compass(deg: number): string {
  const points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]; // prettier-ignore
  return points[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

/** "08:00–18:00", for labels and tooltips — one place so they cannot drift. */
export function workWindowLabel(): string {
  const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;
  return `${pad(WORK_START_H)}–${pad(WORK_END_H)}`;
}

// Open-Meteo returns hourly blocks as parallel arrays: time[] plus one array
// per variable. Nothing here trusts that shape — a missing or short array
// yields nulls for that field rather than an exception, so one endpoint
// changing shape degrades the panel instead of blanking the app.
type HourlyBlock = { time?: unknown; [k: string]: unknown };

/** One local hour of one series: the date it belongs to, its hour, its value. */
type Sample = { date: string; hour: number; value: number | null };

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Split Open-Meteo's local timestamps into (date, hour) pairs.
 *
 * Asked with timezone=Europe/Paris the API returns naive local strings
 * ("2026-09-23T14:00"), so the split is textual on purpose: parsing them into
 * Date objects would re-interpret them in the browser's zone and shift the
 * buckets for anyone not sitting in France.
 */
function parseHours(block: HourlyBlock | undefined, name: string): Sample[] {
  const times = block?.time;
  if (!Array.isArray(times)) return [];
  const values = block?.[name];
  const col = Array.isArray(values) ? values : [];
  const out: Sample[] = [];
  for (let i = 0; i < times.length; i++) {
    const ts = times[i];
    if (typeof ts !== "string") continue;
    const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):/.exec(ts);
    if (!m) continue;
    out.push({ date: m[1], hour: Number(m[2]), value: num(col[i]) });
  }
  return out;
}

function inWindow(s: Sample): boolean {
  return s.hour >= WORK_START_H && s.hour <= WORK_END_H;
}

/**
 * The worst hour of the window, per day.
 *
 * Returns the peak value and the hour it falls on, so a companion series (the
 * wave period, the wind direction) can be read at that same hour instead of
 * being averaged into something that describes no moment in particular.
 */
function peakByDay(samples: Sample[]): Map<string, { value: number; hour: number }> {
  const out = new Map<string, { value: number; hour: number }>();
  for (const s of samples) {
    if (!inWindow(s) || s.value === null) continue;
    const best = out.get(s.date);
    if (!best || s.value > best.value) out.set(s.date, { value: s.value, hour: s.hour });
  }
  return out;
}

/** Value of a series at one given local hour of one given day. */
function atHour(samples: Sample[], date: string, hour: number | null): number | null {
  if (hour === null) return null;
  return samples.find((s) => s.date === date && s.hour === hour)?.value ?? null;
}

async function getJson(url: string, signal?: AbortSignal): Promise<{ hourly?: HourlyBlock }> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${new URL(url).hostname} returned ${res.status}`);
  return res.json();
}

/**
 * One request per endpoint, both for the same days and the same timezone so the
 * two line up on the calendar the app already shows — and so the 08:00–18:00
 * window means the crew's morning, not UTC's.
 */
export async function fetchForecast(signal?: AbortSignal): Promise<DayForecast[]> {
  const common =
    `latitude=${FORECAST_SITE.latitude}&longitude=${FORECAST_SITE.longitude}` +
    `&timezone=Europe%2FParis&forecast_days=${FORECAST_DAYS}`;

  const [marine, weather] = await Promise.all([
    getJson(`${MARINE_URL}?${common}&hourly=wave_height,wave_period`, signal),
    getJson(
      `${WEATHER_URL}?${common}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=ms`,
      signal,
    ),
  ]);

  const hs = parseHours(marine.hourly, "wave_height");
  const period = parseHours(marine.hourly, "wave_period");
  const wind = parseHours(weather.hourly, "wind_speed_10m");
  const gust = parseHours(weather.hourly, "wind_gusts_10m");
  const dir = parseHours(weather.hourly, "wind_direction_10m");

  const hsPeak = peakByDay(hs);
  const windPeak = peakByDay(wind);
  const gustPeak = peakByDay(gust);

  // The two endpoints should agree on the calendar; if one comes back empty the
  // other still sets the days, so a marine outage costs the waves and not the
  // whole panel.
  const dates = [...new Set([...wind.map((s) => s.date), ...hs.map((s) => s.date)])].sort();

  // Hours of the window each day actually carries. The current day is the one
  // that can be short — the model starts at midnight, but a request made at
  // 15:00 for a past hour can come back with nulls — and a day covered only in
  // part must not read like a full one.
  const windowHours = new Set<string>();
  for (const s of [...hs, ...wind]) {
    if (inWindow(s) && s.value !== null) windowHours.add(`${s.date}T${s.hour}`);
  }

  return dates.map((date) => {
    const hsDay = hsPeak.get(date) ?? null;
    const windDay = windPeak.get(date) ?? null;
    const waveHsM = hsDay?.value ?? null;
    const waveHourH = hsDay?.hour ?? null;
    const windHourH = windDay?.hour ?? null;

    let covered = 0;
    for (let h = WORK_START_H; h <= WORK_END_H; h++) {
      if (windowHours.has(`${date}T${h}`)) covered++;
    }

    return {
      date,
      waveHsM,
      waveHmaxM: waveHsM === null ? null : waveHsM * HMAX_OVER_HS,
      wavePeriodS: atHour(period, date, waveHourH),
      waveHourH,
      windMs: windDay?.value ?? null,
      // The gust peaks on its own hour, not necessarily the sustained wind's.
      gustMs: gustPeak.get(date)?.value ?? null,
      windFromDeg: atHour(dir, date, windHourH),
      windHourH,
      hoursCovered: covered,
    };
  });
}
