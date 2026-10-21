import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonStarIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
  SunIcon,
  SunMoonIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AboutDialog } from "@/components/tide/AboutDialog";
import { BuildTag } from "@/components/tide/BuildBadge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DATE_MIN, DATE_MAX, shiftDay } from "@/lib/tide-math";
import type { CoefDayButtonComponent } from "@/components/tide/CoefDayButton";
import { SPEED_POS_MAX, type AnimMode, type AnimState } from "@/hooks/use-time-lapse";
import type { Theme } from "@/hooks/use-theme";
import { useLang, useT } from "@/hooks/use-lang";
import type { Lang } from "@/lib/i18n";

type Props = {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (v: boolean) => void;
  calMonth: Date;
  setCalMonth: (d: Date) => void;
  coefDayButton: CoefDayButtonComponent;
  showWC59: boolean;
  setShowWC59: (fn: (v: boolean) => boolean) => void;
  showSky: boolean;
  setShowSky: (fn: (v: boolean) => boolean) => void;
  setTargetHeight: (h: number) => void;
  animState: AnimState;
  setAnimState: (s: AnimState) => void;
  animMode: AnimMode;
  setAnimMode: (m: AnimMode) => void;
  animActive: boolean;
  startAnim: () => void;
  stopAnim: () => void;
  speedPos: number;
  setSpeedPos: (v: number) => void;
  secPerDay: number;
  theme: Theme;
  toggleTheme: () => void;
};

/** The two languages, each named in itself. Order is the order on screen. */
const LANGS: { lang: Lang; short: string; name: string; hint: string }[] = [
  { lang: "en", short: "EN", name: "English", hint: "Show the app in English" },
  { lang: "fr", short: "FR", name: "Français", hint: "Afficher l'application en français" },
];

/**
 * EN | FR. Both shown, the current one filled — the same segmented shape as
 * Hours | Days below — so it says at a glance which language this is and that
 * the other one is a tap away. Each is labelled in its own language: someone
 * who cannot read the current one still has to find the way out.
 */
function LangSwitch() {
  const { lang, setLang } = useLang();
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex h-8 shrink-0 overflow-hidden rounded-md border border-border bg-background/90 text-xs font-semibold backdrop-blur-sm"
    >
      {LANGS.map((l) => (
        <button
          key={l.lang}
          type="button"
          lang={l.lang}
          aria-label={l.name}
          aria-pressed={lang === l.lang}
          title={l.hint}
          onClick={() => setLang(l.lang)}
          className={`px-2 leading-none transition-colors ${
            lang === l.lang
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

// The top-right control cluster: day navigation + date picker, "jump to today",
// the tether-line preset, the WC59 / theme / about row and the time-lapse
// transport with its speed slider.
export function Controls({
  selectedDate,
  setSelectedDate,
  datePickerOpen,
  setDatePickerOpen,
  calMonth,
  setCalMonth,
  coefDayButton,
  showWC59,
  setShowWC59,
  showSky,
  setShowSky,
  setTargetHeight,
  animState,
  setAnimState,
  animMode,
  setAnimMode,
  animActive,
  startAnim,
  stopAnim,
  speedPos,
  setSpeedPos,
  secPerDay,
  theme,
  toggleTheme,
}: Props) {
  const night = theme === "night";
  const t = useT();
  /** The two things the time-lapse can run. Order is the order on screen. */
  const modes = [
    { mode: "clock" as const, label: t.modeClock, hint: t.modeClockHint },
    { mode: "days" as const, label: t.modeDays, hint: t.modeDaysHint },
  ];
  return (
    <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label={t.prevDay}
          disabled={shiftDay(selectedDate, -1) === null}
          onClick={() => {
            const d = shiftDay(selectedDate, -1);
            if (d) setSelectedDate(d);
          }}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Popover
          open={datePickerOpen}
          onOpenChange={(open) => {
            if (open) setCalMonth(selectedDate);
            setDatePickerOpen(open);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-background/90 backdrop-blur-sm"
            >
              <CalendarIcon className="size-3.5" />
              {t.dateButton(selectedDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setDatePickerOpen(false);
                }
              }}
              month={calMonth}
              onMonthChange={setCalMonth}
              startMonth={DATE_MIN}
              endMonth={DATE_MAX}
              disabled={(date) => date < DATE_MIN || date > DATE_MAX}
              captionLayout="dropdown"
              locale={t.calendarLocale}
              formatters={t.monthDropdown ? { formatMonthDropdown: t.monthDropdown } : undefined}
              components={{ DayButton: coefDayButton }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label={t.nextDay}
          disabled={shiftDay(selectedDate, 1) === null}
          onClick={() => {
            const d = shiftDay(selectedDate, 1);
            if (d) setSelectedDate(d);
          }}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
      {/* The build tag and the language switch ride here rather than floating
          over the plot: this row is the one with width to spare — it sits
          below the view switcher and above the tide column, so it meets
          neither — and in the flow nothing in it can cover anything at any
          viewport. No build tag in the root build — see BuildTag. */}
      <div className="flex items-center gap-1">
        <BuildTag />
        <LangSwitch />
        <Button
          variant="outline"
          size="sm"
          className="bg-background/90 backdrop-blur-sm"
          onClick={() => {
            const today = new Date();
            const clamped = today < DATE_MIN ? DATE_MIN : today > DATE_MAX ? DATE_MAX : today;
            setSelectedDate(clamped);
          }}
        >
          {t.jumpToToday}
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="bg-background/90 backdrop-blur-sm"
        onClick={() => setTargetHeight(2.2)}
      >
        {t.tetherPreset}
      </Button>
      {/* WC59, the day/night toggle and the about panel share a line. The two
          icons are narrow enough to ride alongside WC59 without reaching the
          centred view switcher on a phone, and pulling them out of their own
          rows buys back two rows of the stack for the speed slider below. */}
      <div className="flex items-center gap-1">
        <Button
          variant={showWC59 ? "default" : "outline"}
          size="sm"
          className={showWC59 ? undefined : "bg-background/90 backdrop-blur-sm"}
          onClick={() => setShowWC59((v) => !v)}
        >
          WC59
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label={t.themeLabel(night)}
          title={t.themeTitle(night)}
          onClick={toggleTheme}
        >
          {night ? <SunIcon className="size-4" /> : <MoonStarIcon className="size-4" />}
        </Button>
        <Button
          variant={showSky ? "default" : "outline"}
          size="icon"
          className={`size-8 ${showSky ? "" : "bg-background/90 backdrop-blur-sm"}`}
          aria-label={t.skyLabel(showSky)}
          title={t.skyLabel(showSky)}
          onClick={() => setShowSky((v) => !v)}
        >
          <SunMoonIcon className="size-4" />
        </Button>
        <AboutDialog />
      </div>
      {!animActive ? (
        <Button
          variant="outline"
          size="sm"
          className="bg-background/90 backdrop-blur-sm"
          onClick={startAnim}
        >
          <PlayIcon className="size-4" /> {t.timeLapse}
        </Button>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => setAnimState(animState === "playing" ? "paused" : "playing")}
            >
              {animState === "playing" ? (
                <>
                  <PauseIcon className="size-4" /> {t.pause}
                </>
              ) : (
                <>
                  <PlayIcon className="size-4" /> {t.resume}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-background/90 backdrop-blur-sm"
              onClick={stopAnim}
            >
              <SquareIcon className="size-4" /> {t.stop}
            </Button>
          </div>
          {/* Fixed width so the panel does not twitch as the readout changes
              between "12 s/day" and "4.0 days/s". */}
          <div className="w-48 rounded-md border border-border bg-background/90 px-2.5 py-1 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-1 text-xs">
              {/* The mode replaces a static "Speed" label rather than taking a
                  row of its own: it is what the number beside it means, and the
                  stack pays for every row it grows by. */}
              <div className="flex shrink-0 overflow-hidden rounded border border-border">
                {modes.map(({ mode, label, hint }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAnimMode(mode)}
                    aria-pressed={animMode === mode}
                    title={hint}
                    className={`flex h-7 items-center px-2.5 leading-none transition-colors ${
                      animMode === mode
                        ? "bg-primary font-medium text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="truncate font-medium tabular-nums">{t.speed(secPerDay)}</span>
            </div>
            {/* The root is given a height and the thumb is grown past shadcn's
                16px. Radix takes a pointer down anywhere on the root and its
                thumb is absolutely positioned, so the root's own height is the
                entire grab area — left at its content size it is a 22px strip,
                which is a hairline under a thumb. 36px is a finger. */}
            <Slider
              value={[speedPos]}
              onValueChange={([v]) => setSpeedPos(v)}
              min={0}
              max={SPEED_POS_MAX}
              step={1}
              aria-label={t.speedLabel}
              className="h-9 [&_[role=slider]]:size-5"
            />
          </div>
        </>
      )}
    </div>
  );
}
