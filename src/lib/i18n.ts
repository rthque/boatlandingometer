import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { fr as frDayPicker } from "react-day-picker/locale";
import type { MoonPhase, RangeTrend } from "@/lib/celestial";
import {
  HS_ALERT_M,
  shown,
  WIND_ALERT_MS,
  WORK_END_H,
  WORK_START_H,
  compass as compassEn,
} from "@/lib/forecast";

/**
 * Every word the app puts on screen, in English and in French.
 *
 * One object per language, and `fr` is typed as `typeof en`: a string added to
 * one and forgotten in the other is a compile error, not a half-translated
 * screen. Anything that takes a number is a function, so the French side can
 * write it with a decimal comma.
 *
 * The English side is the app as it always read, string for string — the
 * default language must not move because a second one arrived.
 *
 * Not here, on purpose: the times and durations ("03h35", "2h59") and the axis
 * labels ("5m", "10h") already read the same in both languages; FOU / BL / IRL
 * and WC59 are names; and the "23m", "10m", "Tether line clamp" marks are
 * printed in the drawings themselves. The About panel's prose is long-form and
 * full of emphasis, so it lives as two JSX bodies in AboutDialog instead.
 */

export type Lang = "en" | "fr";

const comma = (s: string) => s.replace(".", ",");
const pad2 = (h: number) => String(h).padStart(2, "0");

const en = {
  htmlLang: "en",
  /** Replaces this part of document.title, so a [TEST] prefix survives. */
  titleSuffix: "Dieppe tides",

  // Language switch
  language: "Language",

  // Control stack
  prevDay: "Previous day",
  nextDay: "Next day",
  dateButton: (d: Date) => format(d, "MMM d, yyyy", { locale: enUS }),
  calendarLocale: enUS as typeof enUS | typeof frDayPicker,
  /**
   * The calendar's month dropdown. shadcn's Calendar words it in the
   * *browser's* language rather than the locale it is given, so French needs
   * its own; English keeps shadcn's, exactly as it always was.
   */
  monthDropdown: null as ((d: Date) => string) | null,
  today: "Today",
  tetherPreset: "2.2m tether clamp works",
  themeLabel: (night: boolean): string => (night ? "Switch to day view" : "Switch to night view"),
  themeTitle: (night: boolean): string => (night ? "Day view" : "Night view"),
  skyLabel: (on: boolean): string => (on ? "Hide the sun and moon" : "Show the sun and moon"),
  aboutLabel: "What this app is for",
  timeLapse: "Time-lapse",
  pause: "Pause",
  resume: "Resume",
  stop: "Stop",
  modeClock: "Hours",
  modeClockHint: "Run the hours of a day — the water climbs and falls",
  modeDays: "Days",
  modeDaysHint: "Run the days — the water stays at the height you set",
  speedLabel: "Time-lapse speed",
  /**
   * The speed readout. It flips units at one second per day, because past
   * that "0.25 s/day" is a number you have to invert in your head to picture,
   * and "4.0 days/s" is the thing you are actually watching.
   */
  speed: (secPerDay: number) =>
    secPerDay >= 1
      ? `${secPerDay < 10 ? secPerDay.toFixed(1) : secPerDay.toFixed(0)} s/day`
      : `${(1 / secPerDay).toFixed(1)} days/s`,

  // Tide extremes
  highWater: "▲ HW",
  lowWater: "▼ LW",
  coefTitle: "Tidal coefficient",

  // Chart
  /** Tide height in the hover tooltip. */
  tipHeight: (h: number) => `${h.toFixed(2)} m`,
  tipWaves: (h: number) => `waves ≈ ${h.toFixed(2)} m`,
  /** Chip on the now marker. */
  chipHeight: (h: number) => `${h.toFixed(2)}m`,
  chipCrest: (h: number) => `≈${h.toFixed(2)}m`,
  crestTitle: (h: number) => `Highest water estimated with the forecast waves: ${h.toFixed(2)} m`,
  sunTitle: (alt: number) => `Sun — ${alt.toFixed(0)}° above the horizon`,
  moonTitle: (phase: MoonPhase, fraction: number, trend: RangeTrend) =>
    `${MOON_EN[phase]}, ${(fraction * 100).toFixed(0)}% lit — ${TREND_EN[trend]}`,

  // Forecast panel
  fcUnavailable: "Forecast unavailable",
  fcUnavailableTitle: "Could not reach the forecast service",
  fcCovers: (days: number) => `Forecast covers ${days} days`,
  /** "08:00–18:00": the working window every figure is the peak of. */
  fcWindow: `${pad2(WORK_START_H)}:00–${pad2(WORK_END_H)}:00`,
  fcHour: (h: number) => `${pad2(h)}:00`,
  fcPeak: (window: string) => `Peak ${window}`,
  fcPeakTitle: (window: string, partial: string) =>
    `Highest value of each figure between ${window} local time — not the 24 h maximum, which a night swell can set hours before anyone is on the water.${partial}`,
  fcPartial: (covered: number, full: number) =>
    ` Only ${covered} of ${full} hours came back, so the peak may be understated.`,
  fcHs: (hs: number) => `Hs ${shown(hs)} m`,
  fcHmax: (hmax: number) => `max ~${shown(hmax)} m`,
  fcHsTitle: (o: FcHsTitle) =>
    `Significant wave height ${shown(o.hs)} m, the worst hour of ${o.window}` +
    (o.hour !== null ? ` (${o.hour})` : "") +
    (o.periodS !== null ? `, period ${o.periodS.toFixed(0)} s` : "") +
    `. Max is the highest individual wave, estimated as 1.86 × Hs — a statistic of the sea state, not a modelled wave.` +
    (o.high ? ` Marked: the peak is at or over ${HS_ALERT_M} m.` : "") +
    o.partial,
  fcHsAlert: `Peak Hs is at or over ${HS_ALERT_M} m`,
  fcWind: (ms: number) => `${shown(ms)} m/s`,
  fcGust: (ms: number) => `gust ${shown(ms)}`,
  fcCompass: compassEn,
  fcWindTitle: (o: FcWindTitle) =>
    `Strongest sustained wind at 10 m between ${o.window}` +
    (o.hour !== null ? ` (${o.hour})` : "") +
    (o.gust !== null ? `, strongest gust ${shown(o.gust)} m/s` : "") +
    `. Direction is the one blowing at the peak-wind hour.` +
    (o.high
      ? ` Marked: the peak is at or over ${WIND_ALERT_MS} m/s. Gusts do not raise the mark.`
      : "") +
    o.partial,
  fcWindAlert: `Peak sustained wind is at or over ${WIND_ALERT_MS} m/s`,
  fcSwitch: "Waves on chart",
  fcSwitchTitle: (on: boolean): string =>
    on
      ? "Hide the forecast waves on the chart"
      : "Draw the forecast waves on the chart — the highest the water reaches, hour by hour",
  fcApprox: "approx. position",
  fcApproxTitle:
    "The forecast point is an approximate offshore position, not the structure itself. Tides are unaffected — they are computed for Dieppe.",
};

export type Strings = typeof en;

type FcHsTitle = {
  hs: number;
  window: string;
  hour: string | null;
  periodS: number | null;
  high: boolean;
  partial: string;
};
type FcWindTitle = {
  window: string;
  hour: string | null;
  gust: number | null;
  high: boolean;
  partial: string;
};

const MOON_EN: Record<MoonPhase, string> = {
  new: "New moon",
  full: "Full moon",
  firstQuarter: "First quarter",
  lastQuarter: "Last quarter",
  waxingCrescent: "Waxing crescent",
  waningCrescent: "Waning crescent",
  waxingGibbous: "Waxing gibbous",
  waningGibbous: "Waning gibbous",
};
const TREND_EN: Record<RangeTrend, string> = {
  aligned: "sun and moon aligned — spring tides, the biggest range",
  square: "sun and moon square — neap tides, the smallest range",
  building: "approaching alignment — range building",
  easing: "approaching square — range easing",
};

const MOON_FR: Record<MoonPhase, string> = {
  new: "Nouvelle lune",
  full: "Pleine lune",
  firstQuarter: "Premier quartier",
  lastQuarter: "Dernier quartier",
  waxingCrescent: "Premier croissant",
  waningCrescent: "Dernier croissant",
  waxingGibbous: "Gibbeuse croissante",
  waningGibbous: "Gibbeuse décroissante",
};
const TREND_FR: Record<RangeTrend, string> = {
  aligned: "soleil et lune alignés — vives-eaux, le plus grand marnage",
  square: "soleil et lune en quadrature — mortes-eaux, le plus petit marnage",
  building: "vers l'alignement — le marnage augmente",
  easing: "vers la quadrature — le marnage diminue",
};

/** Shown with a decimal comma, through the same rounding the 🛑 test uses. */
const shownFr = (v: number) => comma(shown(v));

const fr: Strings = {
  htmlLang: "fr",
  titleSuffix: "marées de Dieppe",

  language: "Langue",

  prevDay: "Jour précédent",
  nextDay: "Jour suivant",
  dateButton: (d) => format(d, "d MMM yyyy", { locale: frDayPicker }),
  calendarLocale: frDayPicker,
  monthDropdown: (d) => d.toLocaleString("fr-FR", { month: "short" }),
  today: "Aujourd'hui",
  tetherPreset: "Travaux collier tether 2,2m",
  themeLabel: (night) => (night ? "Passer en vue de jour" : "Passer en vue de nuit"),
  themeTitle: (night) => (night ? "Vue de jour" : "Vue de nuit"),
  skyLabel: (on) => (on ? "Masquer le soleil et la lune" : "Afficher le soleil et la lune"),
  aboutLabel: "À quoi sert cette application",
  timeLapse: "Accéléré",
  pause: "Pause",
  resume: "Reprendre",
  // "Arrêt", not "Arrêter": the transport row is right-anchored, and on a
  // 375 px phone the longer word pushed Pause onto the tide column.
  stop: "Arrêt",
  modeClock: "Heures",
  modeClockHint: "Faire défiler les heures d'une journée — l'eau monte et descend",
  modeDays: "Jours",
  modeDaysHint: "Faire défiler les jours — l'eau reste à la hauteur choisie",
  speedLabel: "Vitesse de l'accéléré",
  speed: (secPerDay) =>
    secPerDay >= 1
      ? `${comma(secPerDay < 10 ? secPerDay.toFixed(1) : secPerDay.toFixed(0))} s/jour`
      : // "j/s", not "jours/s": "10,0 jours/s" overflows the readout beside
        // Heures | Jours at the fast end of the Days range.
        `${comma((1 / secPerDay).toFixed(1))} j/s`,

  // Pleine mer / basse mer: the abbreviations of the French tide tables.
  highWater: "▲ PM",
  lowWater: "▼ BM",
  coefTitle: "Coefficient de marée",

  tipHeight: (h) => `${comma(h.toFixed(2))} m`,
  tipWaves: (h) => `vagues ≈ ${comma(h.toFixed(2))} m`,
  chipHeight: (h) => `${comma(h.toFixed(2))}m`,
  chipCrest: (h) => `≈${comma(h.toFixed(2))}m`,
  crestTitle: (h) =>
    `Niveau le plus haut estimé avec les vagues prévues\u00a0: ${comma(h.toFixed(2))} m`,
  sunTitle: (alt) => `Soleil — ${alt.toFixed(0)}° au-dessus de l'horizon`,
  moonTitle: (phase, fraction, trend) =>
    `${MOON_FR[phase]}, éclairée à ${(fraction * 100).toFixed(0)}\u00a0% — ${TREND_FR[trend]}`,

  fcUnavailable: "Prévision indisponible",
  fcUnavailableTitle: "Impossible de joindre le service de prévision",
  fcCovers: (days) => `Prévision limitée à ${days} jours`,
  fcWindow: `${pad2(WORK_START_H)}h–${pad2(WORK_END_H)}h`,
  fcHour: (h) => `${pad2(h)}h00`,
  fcPeak: (window) => `Pic ${window}`,
  fcPeakTitle: (window, partial) =>
    `Valeur la plus haute de chaque grandeur entre ${window}, heure locale — et non le maximum sur 24 h, qu'une houle nocturne peut fixer des heures avant que quiconque soit sur l'eau.${partial}`,
  fcPartial: (covered, full) =>
    ` Seules ${covered} heures sur ${full} ont été reçues\u00a0: le pic peut être sous-estimé.`,
  fcHs: (hs) => `Hs ${shownFr(hs)} m`,
  fcHmax: (hmax) => `max ~${shownFr(hmax)} m`,
  fcHsTitle: (o) =>
    `Hauteur significative des vagues ${shownFr(o.hs)} m, à l'heure la plus forte de ${o.window}` +
    (o.hour !== null ? ` (${o.hour})` : "") +
    (o.periodS !== null ? `, période ${o.periodS.toFixed(0)} s` : "") +
    `. Le max est la plus haute vague individuelle, estimée à 1,86 × Hs — une statistique de l'état de la mer, pas une vague modélisée.` +
    (o.high ? ` Marqué\u00a0: le pic atteint ou dépasse ${comma(String(HS_ALERT_M))} m.` : "") +
    o.partial,
  fcHsAlert: `Le pic de Hs atteint ou dépasse ${comma(String(HS_ALERT_M))} m`,
  fcWind: (ms) => `${shownFr(ms)} m/s`,
  // "raf." is how French marine forecasts abbreviate rafale.
  fcGust: (ms) => `raf. ${shownFr(ms)}`,
  // Ouest is O in French; every other compass letter is the same.
  fcCompass: (deg) => compassEn(deg).replace(/W/g, "O"),
  fcWindTitle: (o) =>
    `Vent moyen le plus fort à 10 m entre ${o.window}` +
    (o.hour !== null ? ` (${o.hour})` : "") +
    (o.gust !== null ? `, rafale la plus forte ${shownFr(o.gust)} m/s` : "") +
    `. La direction est celle du vent à l'heure du pic.` +
    (o.high
      ? ` Marqué\u00a0: le pic atteint ou dépasse ${WIND_ALERT_MS} m/s. Les rafales ne déclenchent pas la marque.`
      : "") +
    o.partial,
  fcWindAlert: `Le pic de vent moyen atteint ou dépasse ${WIND_ALERT_MS} m/s`,
  fcSwitch: "Afficher les vagues",
  fcSwitchTitle: (on) =>
    on
      ? "Masquer les vagues prévues sur le graphique"
      : "Tracer les vagues prévues sur le graphique — le niveau le plus haut atteint par l'eau, heure par heure",
  fcApprox: "position approx.",
  fcApproxTitle:
    "Le point de prévision est une position au large approximative, pas la structure elle-même. Les marées n'en dépendent pas — elles sont calculées pour Dieppe.",
};

export const STRINGS: Record<Lang, Strings> = { en, fr };
