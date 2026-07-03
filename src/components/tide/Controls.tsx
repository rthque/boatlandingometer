import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DATE_MIN, DATE_MAX, shiftDay } from "@/lib/tide-math";
import type { CoefDayButtonComponent } from "@/components/tide/CoefDayButton";
import type { AnimState } from "@/hooks/use-time-lapse";

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
  setTargetHeight: (h: number) => void;
  animState: AnimState;
  setAnimState: (s: AnimState) => void;
  animActive: boolean;
  startAnim: () => void;
  stopAnim: () => void;
};

// The top-right control cluster: day navigation + date picker, "jump to today",
// the tether-line preset, the WC59 toggle and the time-lapse transport.
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
  setTargetHeight,
  animState,
  setAnimState,
  animActive,
  startAnim,
  stopAnim,
}: Props) {
  return (
    <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label="Previous day"
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
              {format(selectedDate, "MMM d, yyyy", { locale: enUS })}
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
              locale={enUS}
              components={{ DayButton: coefDayButton }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label="Next day"
          disabled={shiftDay(selectedDate, 1) === null}
          onClick={() => {
            const d = shiftDay(selectedDate, 1);
            if (d) setSelectedDate(d);
          }}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
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
        Jump to today
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-background/90 backdrop-blur-sm"
        onClick={() => setTargetHeight(2.2)}
      >
        Bottom tether line works
      </Button>
      <Button
        variant={showWC59 ? "default" : "outline"}
        size="sm"
        className={showWC59 ? undefined : "bg-background/90 backdrop-blur-sm"}
        onClick={() => setShowWC59((v) => !v)}
      >
        WC59
      </Button>
      {!animActive ? (
        <Button
          variant="outline"
          size="sm"
          className="bg-background/90 backdrop-blur-sm"
          onClick={startAnim}
        >
          <PlayIcon className="size-4" /> Time-lapse
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            onClick={() => setAnimState(animState === "playing" ? "paused" : "playing")}
          >
            {animState === "playing" ? (
              <>
                <PauseIcon className="size-4" /> Pause
              </>
            ) : (
              <>
                <PlayIcon className="size-4" /> Resume
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/90 backdrop-blur-sm"
            onClick={stopAnim}
          >
            <SquareIcon className="size-4" /> Stop
          </Button>
        </div>
      )}
    </div>
  );
}
