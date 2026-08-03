import { fmtTime, type ExtremePoint } from "@/lib/tide-math";

// The list of the day's high/low waters (time, height and, for high waters, the
// tidal coefficient), pinned to the bottom-left on phones and top-left on wider
// screens.
export function ExtremesList({ extremes }: { extremes: ExtremePoint[] }) {
  return (
    <div className="absolute top-24 left-2 z-20 flex flex-col gap-0.5">
      {extremes.map((e, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium bg-background/90 backdrop-blur-sm border border-border"
        >
          {/* Two steps for one problem: the 600 inks only reached 3.4:1 on the
              white card (a pre-existing miss), and on the night card they and
              the coefficient badge fell to ~4:1 and 2.3:1. Darker by day,
              lighter by night. */}
          <span
            className={
              e.high
                ? "text-orange-700 dark:text-orange-400"
                : "text-emerald-700 dark:text-emerald-400"
            }
          >
            {e.high ? "▲ HW" : "▼ LW"}
          </span>
          <span>{fmtTime(e.t)}</span>
          <span className="text-muted-foreground">{e.h.toFixed(2)}m</span>
          {e.high && e.coef !== null && (
            <span
              className="ml-0.5 rounded bg-sky-600/15 px-1 font-semibold text-sky-700 dark:bg-sky-400/20 dark:text-sky-200"
              title="Tidal coefficient"
            >
              {e.coef}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
