import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import { useT } from "@/hooks/use-lang";
import { cn } from "@/lib/utils";

const CHIP =
  "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background/95 px-3.5 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur-sm data-[armed=true]:border-transparent data-[armed=true]:bg-primary data-[armed=true]:text-primary-foreground";

/**
 * What a vertical swipe will do, shown while the finger is still down.
 *
 * Two chips, invisible until a swipe moves them: each slides in from the edge
 * its target lies behind — the calendar from the top, the info from the
 * bottom — and fills in once letting go will do it. Their position, opacity
 * and armed state are written by useSwipe directly; React only renders them
 * and their words.
 *
 * Each chip's wrapper does the placing, so the chip's own transform is free
 * for the swipe to drive. The sideways swipe has no chip here: the day it
 * brings in carries its own (DayHint).
 */
export function SwipeHints() {
  const t = useT();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <div data-hint="down" className={cn(CHIP, "opacity-0")}>
          <CalendarIcon className="size-4" />
          {t.swipeCalendar}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div data-hint="up" className={cn(CHIP, "opacity-0")}>
          <InfoIcon className="size-4" />
          {t.swipeInfo}
        </div>
      </div>
    </div>
  );
}

/**
 * The edge of a neighbouring day's page in the touch carousel: midnight, as a
 * dashed line, and the day's name on a chip just inside it.
 *
 * Both ride with the page, so the day being pulled in says which day it is as
 * it comes, and the line marks where one day ends and the next begins — the
 * curve runs straight across it, because the tide does. The chip fills in once
 * letting go will land on that day; useSwipe sets that, not React.
 *
 * `top` is where the chip goes, px. Not simply the middle of the screen: in
 * the FOU view that is where the sunrise chip sits, just above the 10 m line,
 * and the two landed on each other.
 */
export function DayHint({ role, date, top }: { role: "prev" | "next"; date: Date; top: number }) {
  const t = useT();
  const next = role === "next";
  return (
    <div aria-hidden>
      <div
        className={cn(
          "absolute inset-y-0 border-dashed border-foreground/40",
          next ? "left-0 border-l-2" : "right-0 border-r-2",
        )}
      />
      <div className={cn("absolute", next ? "left-3" : "right-3")} style={{ top }}>
        <div data-hint={role} className={CHIP}>
          {!next && <ChevronLeftIcon className="size-4" />}
          {t.swipeDay(date)}
          {next && <ChevronRightIcon className="size-4" />}
        </div>
      </div>
    </div>
  );
}
