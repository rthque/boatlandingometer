import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import { useT } from "@/hooks/use-lang";

/**
 * What a swipe will do, shown while the finger is still down.
 *
 * Four chips, invisible until a swipe moves them: each slides in from the edge
 * its target lies behind — the next day from the right, the previous one from
 * the left, the calendar from the top, the info from the bottom — and fills in
 * once letting go will do it. Their position, opacity and armed state are
 * written by useSwipe directly; React only renders them and their words.
 *
 * Each chip's wrapper does the placing, so the chip's own transform is free
 * for the swipe to drive.
 */
export function SwipeHints({ prev, next }: { prev: Date | null; next: Date | null }) {
  const t = useT();
  const chip =
    "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background/95 px-3.5 py-2 text-sm font-semibold text-foreground opacity-0 shadow-lg backdrop-blur-sm data-[armed=true]:border-transparent data-[armed=true]:bg-primary data-[armed=true]:text-primary-foreground";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <div data-hint="prev" className={chip}>
          <ChevronLeftIcon className="size-4" />
          {prev ? t.swipeDay(prev) : ""}
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <div data-hint="next" className={chip}>
          {next ? t.swipeDay(next) : ""}
          <ChevronRightIcon className="size-4" />
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <div data-hint="down" className={chip}>
          <CalendarIcon className="size-4" />
          {t.swipeCalendar}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div data-hint="up" className={chip}>
          <InfoIcon className="size-4" />
          {t.swipeInfo}
        </div>
      </div>
    </div>
  );
}
